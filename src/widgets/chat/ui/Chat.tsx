"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { fetchListing } from "@/entities/item";
import { getAccessToken } from "@/shared/api/auth-headers";
import styles from "./Chat.module.css";

type SavedUser = {
  id?: string;
  email?: string;
  name?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  photo?: string | null;
};

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  time: string;
};

type ProfileResponse = {
  id: string;
  name?: string;
  avatar_url?: string | null;
};

const MESSAGES_KEY = "dobry-shkaf-chat-threads";

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Chat() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const requestedUserId = searchParams.get("user") || "";
  const requestedUserName = searchParams.get("userName") || "";
  const requestedUserAvatar = searchParams.get("userAvatar") || "";
  const itemId = searchParams.get("item") || "";

  const threadId = requestedUserId || "demo-contact";

  const [currentUserId, setCurrentUserId] = useState("");
  const [chatName, setChatName] = useState(
    requestedUserName || "Пользователь",
  );
  const [chatAvatar, setChatAvatar] = useState(requestedUserAvatar);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  const [itemTitle, setItemTitle] = useState(
    searchParams.get("itemTitle") || "",
  );
  const [itemPhoto, setItemPhoto] = useState("");
  const [itemTransfer, setItemTransfer] = useState<"exchange" | "free">(
    "exchange",
  );
  const [itemOwnerId, setItemOwnerId] = useState("");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const token = getAccessToken();
    const rawUser = localStorage.getItem("dobry-shkaf-user");
  
    let authorized = false;
  
    if (token && rawUser) {
      try {
        const user = JSON.parse(rawUser) as SavedUser;
        authorized = Boolean(user.id);
      } catch {
        authorized = false;
      }
    }
  
    if (!authorized) {
      const returnUrl = `${pathname}${window.location.search}`;
  
      router.replace(
        `/login?from=${encodeURIComponent(returnUrl)}`,
      );
    }
  }, [pathname, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadChat() {
      try {
        const rawUser = localStorage.getItem("dobry-shkaf-user");
        const user = rawUser ? (JSON.parse(rawUser) as SavedUser) : null;

        if (!cancelled) {
          setCurrentUserId(user?.id || "");
        }

        if (user?.id && user.id === requestedUserId) {
          if (!cancelled) {
            setChatName(user.name || requestedUserName || "Пользователь");
            setChatAvatar(
              user.avatar_url || user.avatarUrl || user.photo || "",
            );
          }
        } else {
          if (!cancelled) {
            setChatName(requestedUserName || "Пользователь");
            setChatAvatar(requestedUserAvatar);
          }
        }

        if (itemId) {
          try {
            const listing = await fetchListing(itemId);

            if (!cancelled) {
              setItemTitle(listing.title);
              setItemPhoto(
                listing.photoUrls?.[0] || listing.coverUrl || "",
              );
              setItemTransfer(
                listing.transferType === "free" ? "free" : "exchange",
              );
              setItemOwnerId(listing.ownerId || "");
            }
          } catch {
            
          }
        }

        const stored = JSON.parse(
          localStorage.getItem(MESSAGES_KEY) || "{}",
        ) as Record<string, ChatMessage[]>;

        if (!cancelled) {
          setMessages(stored[threadId] || []);
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void loadChat();

    return () => {
      cancelled = true;
    };
  }, [
    itemId,
    threadId,
    requestedUserId,
    requestedUserName,
    requestedUserAvatar,
  ]);

  const preview = useMemo(() => {
    const last = messages[messages.length - 1];

    return (
      last?.text ||
      (itemTitle ? `Объявление: ${itemTitle}` : "Начните переписку")
    );
  }, [messages, itemTitle]);

  function saveMessages(nextMessages: ChatMessage[]) {
    setMessages(nextMessages);

    try {
      const stored = JSON.parse(
        localStorage.getItem(MESSAGES_KEY) || "{}",
      ) as Record<string, ChatMessage[]>;

      stored[threadId] = nextMessages;

      localStorage.setItem(MESSAGES_KEY, JSON.stringify(stored));
    } catch {
      
    }
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !currentUserId) return;

    const nextMessages = [
      ...messages,
      {
        id: `${Date.now()}`,
        senderId: currentUserId,
        text,
        time: formatTime(),
      },
    ];

    saveMessages(nextMessages);
    setDraft("");
  }

  function startTransfer() {
    if (!itemId || !itemOwnerId || itemOwnerId !== currentUserId) {
      window.alert("Передать вещь может только владелец объявления.");
      return;
    }

    window.alert(
      "Передача вещи через чат пока недоступна: дождитесь подключения API запросов.",
    );
  }

  if (!loaded) return null;

  return (
    <main className={styles.page}>
      <div className={styles.chatLayout}>
        <aside className={styles.sidebar}>
          <h1 className={styles.pageTitle}>Сообщения</h1>

          {requestedUserId ? (
            <div className={`${styles.dialog} ${styles.activeDialog}`}>
              <span className={styles.dialogPhoto}>
                {itemPhoto ? <img src={itemPhoto} alt="" /> : <span />}
              </span>

              <span className={styles.dialogText}>
                <strong>{chatName}</strong>

                <span className={styles.dialogItem}>
                  {itemTitle || "Объявление"}
                </span>

                <span className={styles.dialogPreview}>{preview}</span>
              </span>

              <span className={styles.dialogTime}>
                {messages[messages.length - 1]?.time || ""}
              </span>
            </div>
          ) : (
            <div className={styles.emptyDialogs}>
              Здесь появятся ваши переписки с пользователями.
            </div>
          )}
        </aside>

        <section className={styles.thread} aria-label="Переписка">
          {requestedUserId ? (
            <>
              <header className={styles.threadHeader}>
                {chatAvatar ? (
                  <img
                    className={styles.headerAvatar}
                    src={chatAvatar}
                    alt=""
                  />
                ) : (
                  <span className={styles.headerAvatar} />
                )}

                <strong>{chatName}</strong>
              </header>

              {itemTitle && (
                <div className={styles.itemPreview}>
                  <span className={styles.itemPhoto}>
                    {itemPhoto ? <img src={itemPhoto} alt="" /> : null}
                  </span>

                  <span className={styles.itemInfo}>
                    <strong>{itemTitle}</strong>

                    <small>
                      {itemTransfer === "exchange" ? "Обмен" : "Бесплатно"}
                    </small>
                  </span>

                  {currentUserId &&
                    itemOwnerId &&
                    itemOwnerId === currentUserId && (
                      <button
                        type="button"
                        className={styles.transferButton}
                        onClick={startTransfer}
                      >
                        Передать вещь
                      </button>
                    )}
                </div>
              )}

              <div className={styles.messages}>
                {messages.length === 0 ? (
                  <div className={styles.emptyThread}>
                    <span>Сегодня</span>
                    <p>
                      Начните общение — напишите {chatName.toLowerCase()}.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={styles.dayLabel}>Сегодня</div>

                    {messages.map((message) => {
                      const own = message.senderId === currentUserId;

                      return (
                        <div
                          key={message.id}
                          className={`${styles.messageRow} ${
                            own ? styles.ownRow : styles.theirRow
                          }`}
                        >
                          <div
                            className={`${styles.bubble} ${
                              own ? styles.ownBubble : styles.theirBubble
                            }`}
                          >
                            <p>{message.text}</p>
                            <time>{message.time}</time>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

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
                  disabled={!draft.trim() || !currentUserId}
                >
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
                </button>
              </form>
            </>
          ) : (
            <div className={styles.noSelection}>
              <h2>Выберите переписку</h2>
              <p>
                Откройте объявление и нажмите «Написать», чтобы связаться с его
                владельцем.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}