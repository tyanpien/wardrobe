import { http } from "@/shared/api/http";
import { authHeaders } from "@/shared/api/auth-headers";
import { resolveMediaUrl } from "@/entities/item/model/mappers";
import type {
  ChatDetail,
  ChatDto,
  ChatListItem,
  ChatListResponseDto,
  MessageDto,
  MessageListResponseDto,
  ChatMessage,
  Transfer,
  TransferDto,
  TransferHistoryResponseDto,
} from "../model/types";

function mapTransfer(dto: TransferDto): Transfer {
  return {
    id: dto.id,
    chatId: dto.chat_id,
    listingId: dto.listing_id,
    ownerId: dto.owner_id,
    recipientId: dto.recipient_id,
    status: dto.status,
    ownerConfirmed: dto.owner_confirmed,
    recipientConfirmed: dto.recipient_confirmed,
    currentUserConfirmed: dto.current_user_confirmed,
    canConfirm: dto.can_confirm,
    canStart: dto.can_start,
    listingStatus: dto.listing_status,
    completedAt: dto.completed_at,
    createdAt: dto.created_at,
  };
}

function mapChat(dto: ChatDto): ChatDetail {
  return {
    id: dto.id,
    listingId: dto.listing_id,
    ownerId: dto.owner_id,
    participantId: dto.participant_id,
    listing: {
      ...dto.listing,
      image: dto.listing.image ? resolveMediaUrl(dto.listing.image) : null,
    },
    owner: dto.owner,
    participant: dto.participant,
    transfer: dto.transfer ? mapTransfer(dto.transfer) : null,
    canStartTransfer: dto.can_start_transfer,
    createdAt: dto.created_at,
  };
}

function mapMessage(dto: MessageDto): ChatMessage {
  return {
    id: dto.id,
    senderId: dto.sender_id,
    type: dto.type,
    text: dto.text,
    createdAt: dto.created_at,
  };
}

export async function openListingChat(listingId: string): Promise<ChatDetail> {
  const { data } = await http.post<ChatDto>(
    `/api/v1/listings/${encodeURIComponent(listingId)}/chat`,
    {},
    { headers: authHeaders() },
  );
  return mapChat(data);
}

export async function fetchMyChats(page = 1, pageSize = 100): Promise<ChatListItem[]> {
  const { data } = await http.get<ChatListResponseDto>("/api/v1/me/chats", {
    headers: authHeaders(),
    params: { page, page_size: pageSize },
  });
  return data.items.map((item): ChatListItem => ({
    id: item.id,
    listingId: item.listing_id,
    otherUser: item.other_user,
    listing: {
      ...item.listing,
      image: item.listing.image ? resolveMediaUrl(item.listing.image) : null,
    },
    lastMessage: item.last_message,
    unreadCount: item.unread_count,
    transferStatus: item.transfer_status,
  }));
}

export async function fetchChat(chatId: string): Promise<ChatDetail> {
  const { data } = await http.get<ChatDto>(
    `/api/v1/me/chats/${encodeURIComponent(chatId)}`,
    { headers: authHeaders() },
  );
  return mapChat(data);
}

export async function fetchChatMessages(chatId: string): Promise<ChatMessage[]> {
  const { data } = await http.get<MessageListResponseDto>(
    `/api/v1/me/chats/${encodeURIComponent(chatId)}/messages`,
    { headers: authHeaders(), params: { page: 1, page_size: 100 } },
  );
  return data.items.map(mapMessage);
}

export async function postChatMessage(chatId: string, text: string): Promise<ChatMessage> {
  const { data } = await http.post<MessageDto>(
    `/api/v1/me/chats/${encodeURIComponent(chatId)}/messages`,
    { text },
    { headers: authHeaders() },
  );
  return mapMessage(data);
}

export async function startChatTransfer(chatId: string): Promise<Transfer> {
  const { data } = await http.post<TransferDto>(
    `/api/v1/me/chats/${encodeURIComponent(chatId)}/transfer/start`,
    {},
    { headers: authHeaders() },
  );
  return mapTransfer(data);
}

export async function confirmChatTransfer(chatId: string): Promise<Transfer> {
  const { data } = await http.post<TransferDto>(
    `/api/v1/me/chats/${encodeURIComponent(chatId)}/transfer/confirm`,
    {},
    { headers: authHeaders() },
  );
  return mapTransfer(data);
}

export async function fetchChatTransfer(chatId: string): Promise<Transfer> {
  const { data } = await http.get<TransferDto>(
    `/api/v1/me/chats/${encodeURIComponent(chatId)}/transfer`,
    { headers: authHeaders() },
  );
  return mapTransfer(data);
}

export async function fetchTransferHistory(page = 1, pageSize = 20) {
  const { data } = await http.get<TransferHistoryResponseDto>(
    "/api/v1/me/transfer-history",
    { headers: authHeaders(), params: { page, page_size: pageSize } },
  );
  return data;
}