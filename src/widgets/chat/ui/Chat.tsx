
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  confirmChatTransfer,
  fetchChat,
  fetchChatMessages,
  fetchMyChats,
  openListingChat,
  postChatMessage,
  startChatTransfer,
} from "@/entities/chat";
import type { ChatDetail, ChatListItem, ChatMessage, Transfer } from "@/entities/chat";
import { getApiErrorMessage } from "@/shared/api/errors";
import { StartTransferModal } from "@/features/start-transfer";
import { ConfirmTransferActions } from "@/features/confirm-transfer";
import styles from "./Chat.module.css";

type SavedUser = { id?: string; name?: string; email?: string };

function timeLabel(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedChatId = searchParams.get("chat") || "";
  const requestedListingId = searchParams.get("item") || "";
  const requestedUserId = searchParams.get("user") || "";

  const [currentUserId, setCurrentUserId] = useState("");
  const [dialogs, setDialogs] = useState<ChatListItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeChatIdRef = useRef("");
  const dialogsOrderRef = useRef<string[]>([]);

  const updateDialogs = useCallback((list: ChatListItem[]) => {
    const dialogsMap = new Map(list.map((dialog) => [dialog.id, dialog]));

    const order = dialogsOrderRef.current.filter((id) => dialogsMap.has(id));
    const knownIds = new Set(order);

    for (const dialog of list) {
      if (!knownIds.has(dialog.id)) {
        order.push(dialog.id);
        knownIds.add(dialog.id);
      }
    }

    dialogsOrderRef.current = order;
    setDialogs(order.map((id) => dialogsMap.get(id)!));
  }, []);

  const applyChat = useCallback((chat: ChatDetail) => {
    setActiveChat(chat);
    activeChatIdRef.current = chat.id;
  }, []);

  const refreshDialogs = useCallback(async () => {
    const list = await fetchMyChats();
    updateDialogs(list);
    return list;
  }, [updateDialogs]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError("");

      try {
        const raw = localStorage.getItem("dobry-shkaf-user");
        const user = raw ? (JSON.parse(raw) as SavedUser) : null;

        if (!user?.id) {
          throw new Error("Не удалось определить пользователя. Войдите в аккаунт заново.");
        }

        if (!cancelled) setCurrentUserId(user.id);

        if (requestedListingId && !requestedChatId) {
          const opened = await openListingChat(requestedListingId);
          if (cancelled) return;

          router.replace(`/messages?chat=${encodeURIComponent(opened.id)}`);
          applyChat(opened);

          const nextMessages = await fetchChatMessages(opened.id);
          if (!cancelled) setMessages(nextMessages);

          const list = await fetchMyChats();
          if (!cancelled) updateDialogs(list);

          return;
        }

        const list = await fetchMyChats();
        if (cancelled) return;

        updateDialogs(list);

        const matchingUserChat = requestedUserId
          ? list.find((item) => item.otherUser.id === requestedUserId)
          : undefined;

        const chatId =
          requestedChatId ||
          matchingUserChat?.id ||
          (!requestedUserId ? list[0]?.id || "" : "");

        if (requestedUserId && !matchingUserChat && !requestedChatId) {
          setError(
            "Чтобы начать новую переписку, откройте конкретное объявление этого пользователя и нажмите «Написать». "
          );
        }

        if (chatId) {
          activeChatIdRef.current = chatId;

          const [chat, nextMessages] = await Promise.all([
            fetchChat(chatId),
            fetchChatMessages(chatId),
          ]);

          if (cancelled) return;

          applyChat(chat);
          setMessages(nextMessages);

          if (!requestedChatId) {
            router.replace(`/messages?chat=${encodeURIComponent(chatId)}`);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "Не удалось загрузить диалоги."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [
    requestedChatId,
    requestedListingId,
    requestedUserId,
    router,
    applyChat,
    updateDialogs,
  ]);

  useEffect(() => {
    if (!activeChat?.id) return;

    const chatId = activeChat.id;
    let stopped = false;
    let busy = false;

    const poll = async () => {
      if (busy || stopped || document.visibilityState === "hidden") return;

      busy = true;

      try {
        const [chat, nextMessages, list] = await Promise.all([
          fetchChat(chatId),
          fetchChatMessages(chatId),
          fetchMyChats(),
        ]);

        if (stopped || activeChatIdRef.current !== chatId) return;

        setActiveChat(chat);

        setMessages((previous) => {
          const same =
            previous.length === nextMessages.length &&
            previous.every((m, i) => m.id === nextMessages[i]?.id);

          return same ? previous : nextMessages;
        });

        updateDialogs(list);
      } catch {
      } finally {
        busy = false;
      }
    };

    const timer = window.setInterval(() => {
      void poll();
    }, 4000);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [activeChat?.id, updateDialogs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, activeChat?.id]);

  const otherUser = useMemo(() => {
    if (!activeChat) return null;

    return activeChat.ownerId === currentUserId
      ? activeChat.participant
      : activeChat.owner;
  }, [activeChat, currentUserId]);

  const isOwner = Boolean(activeChat && activeChat.ownerId === currentUserId);

  const listingStatus =
    activeChat?.transfer?.listingStatus ||
    activeChat?.listing.status ||
    "published";

  async function selectChat(chatId: string) {
    if (chatId === activeChat?.id) return;

    setLoading(true);
    setError("");
    activeChatIdRef.current = chatId;

    router.push(`/messages?chat=${encodeURIComponent(chatId)}`);

    try {
      const [chat, nextMessages] = await Promise.all([
        fetchChat(chatId),
        fetchChatMessages(chatId),
      ]);

      if (activeChatIdRef.current !== chatId) return;

      applyChat(chat);
      setMessages(nextMessages);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Не удалось открыть диалог."));
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !activeChat || sending) return;

    setSending(true);
    setActionError("");

    try {
      const created = await postChatMessage(activeChat.id, text);

      setMessages((previous) =>
        previous.some((item) => item.id === created.id)
          ? previous
          : [...previous, created]
      );

      setDraft("");
      void refreshDialogs();
    } catch (sendError) {
      setActionError(
        getApiErrorMessage(sendError, "Не удалось отправить сообщение.")
      );
    } finally {
      setSending(false);
    }
  }

  async function handleStartTransfer() {
    if (!activeChat || !isOwner || starting) return;

    setStarting(true);
    setActionError("");

    try {
      const transfer = await startChatTransfer(activeChat.id);

      setActiveChat((current) =>
        current
          ? {
              ...current,
              transfer,
              canStartTransfer: false,
              listing: {
                ...current.listing,
                status: transfer.listingStatus || "in_transfer",
              },
            }
          : current
      );

      setModalOpen(false);

      const [nextMessages, list] = await Promise.all([
        fetchChatMessages(activeChat.id),
        fetchMyChats(),
      ]);

      setMessages(nextMessages);
      updateDialogs(list);
    } catch (startError) {
      setActionError(
        getApiErrorMessage(startError, "Не удалось начать передачу.")
      );
    } finally {
      setStarting(false);
    }
  }

  async function handleConfirmTransfer() {
    if (!activeChat || confirming || !activeChat.transfer?.canConfirm) return;

    setConfirming(true);
    setActionError("");

    try {
      const transfer: Transfer = await confirmChatTransfer(activeChat.id);

      setActiveChat((current) =>
        current
          ? {
              ...current,
              transfer,
              listing: {
                ...current.listing,
                status: transfer.listingStatus || current.listing.status,
              },
            }
          : current
      );

      const [nextMessages, list] = await Promise.all([
        fetchChatMessages(activeChat.id),
        fetchMyChats(),
      ]);

      setMessages(nextMessages);
      updateDialogs(list);
    } catch (confirmError) {
      setActionError(
        getApiErrorMessage(confirmError, "Не удалось подтвердить передачу.")
      );

      try {
        const refreshed = await fetchChat(activeChat.id);
        setActiveChat(refreshed);
      } catch {}
    } finally {
      setConfirming(false);
    }
  }

  const headerStatus =
    activeChat?.transfer?.status === "completed" ||
    listingStatus === "transferred"
      ? "Передано"
      : activeChat?.transfer || listingStatus === "in_transfer"
        ? "В процессе передачи"
        : "";

  if (loading && !activeChat) {
    return (
      <main className={styles.page}>
        <div className={styles.centerState}>Загружаем диалоги…</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.chatLayout}>
        <aside className={styles.sidebar}>
          <h1 className={styles.pageTitle}>Сообщения</h1>

          {dialogs.length === 0 ? (
            <div className={styles.emptyDialogs}>
              Здесь появятся ваши переписки с пользователями.
            </div>
          ) : (
            dialogs.map((dialog) => (
              <button
                type="button"
                key={dialog.id}
                className={`${styles.dialog} ${
                  activeChat?.id === dialog.id ? styles.activeDialog : ""
                }`}
                onClick={() => void selectChat(dialog.id)}
              >
                <span className={styles.dialogPhoto}>
                  {dialog.listing.image ? (
                    <img src={dialog.listing.image} alt="" />
                  ) : null}
                </span>

                <span className={styles.dialogText}>
                  <strong>{dialog.otherUser.name}</strong>
                  <span className={styles.dialogItem}>
                    {dialog.listing.title}
                  </span>
                  <span className={styles.dialogPreview}>
                    {dialog.lastMessage?.text || "Начните переписку"}
                  </span>
                </span>

                <span className={styles.dialogMeta}>
                  <span className={styles.dialogTime}>
                    {timeLabel(dialog.lastMessage?.created_at || null)}
                  </span>

                  {dialog.unreadCount > 0 && (
                    <span className={styles.unread}>
                      {dialog.unreadCount}
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </aside>

        <section className={styles.thread} aria-label="Переписка">
          {error && <div className={styles.error}>{error}</div>}

          {!activeChat ? (
            <div className={styles.noSelection}>
              <h2>Выберите переписку</h2>
              <p>
                Откройте объявление и нажмите «Написать», чтобы связаться с
                владельцем.
              </p>
            </div>
          ) : (
            <>
              <header className={styles.threadHeader}>
                <span className={styles.headerAvatar}>
                  {otherUser?.avatar_url ? (
                    <img src={otherUser.avatar_url} alt="" />
                  ) : null}
                </span>
                <strong>{otherUser?.name || "Пользователь"}</strong>
              </header>

              <div className={styles.itemPreview}>
                <span className={styles.itemPhoto}>
                  {activeChat.listing.image ? (
                    <img src={activeChat.listing.image} alt="" />
                  ) : null}
                </span>

                <span className={styles.itemInfo}>
                  <strong>{activeChat.listing.title}</strong>
                  <small>
                    {activeChat.listing.transfer_type === "Обмен"
                      ? "Обмен"
                      : "Бесплатно"}
                  </small>
                </span>

                {activeChat.canStartTransfer &&
                isOwner &&
                !activeChat.transfer ? (
                  <button
                    type="button"
                    className={styles.transferButton}
                    onClick={() => setModalOpen(true)}
                  >
                    Передать вещь
                  </button>
                ) : headerStatus ? (
                  <span
                    className={`${styles.statusBadge} ${
                      headerStatus === "Передано"
                        ? styles.statusCompleted
                        : ""
                    }`}
                  >
                    {headerStatus}
                  </span>
                ) : null}
              </div>

              <div className={styles.messages}>
                {messages.length === 0 ? (
                  <div className={styles.emptyThread}>
                    <span>Сегодня</span>
                    <p>
                      Начните общение — напишите{" "}
                      {otherUser?.name || "пользователю"}.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const own = message.senderId === currentUserId;
                    const isSystem = message.type === "system";

                    const previousDate =
                      index > 0
                        ? dateLabel(messages[index - 1].createdAt)
                        : "";

                    const currentDate = dateLabel(message.createdAt);

                    return (
                      <div key={message.id}>
                        {currentDate && currentDate !== previousDate && (
                          <div className={styles.dayLabel}>{currentDate}</div>
                        )}

                        <div
                          className={`${styles.messageRow} ${
                            isSystem
                              ? styles.systemRow
                              : own
                                ? styles.ownRow
                                : styles.theirRow
                          }`}
                        >
                          <div
                            className={`${styles.bubble} ${
                              isSystem
                                ? styles.systemBubble
                                : own
                                  ? styles.ownBubble
                                  : styles.theirBubble
                            }`}
                          >
                            <p>{message.text}</p>
                            {!isSystem && (
                              <time>{timeLabel(message.createdAt)}</time>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {activeChat.transfer && (
                <ConfirmTransferActions
                  transfer={activeChat.transfer}
                  currentUserId={currentUserId}
                  loading={confirming}
                  onConfirm={() => void handleConfirmTransfer()}
                />
              )}

              {actionError && (
                <p className={styles.actionError}>{actionError}</p>
              )}

              <form className={styles.composer} onSubmit={sendMessage}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Сообщение"
                  rows={1}
                  aria-label="Текст сообщения"
                />

                <button
                  type="submit"
                  aria-label="Отправить сообщение"
                  disabled={!draft.trim() || sending}
                >
                  {sending ? (
                    "…"
                  ) : (
                    <svg
                      viewBox="0 0 28 28"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 4.5L25 14L3 23.5L7.5 14L3 4.5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.5 14H25"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      <StartTransferModal
        open={modalOpen}
        loading={starting}
        onCancel={() => setModalOpen(false)}
        onStart={() => void handleStartTransfer()}
      />
    </main>
  );
}
