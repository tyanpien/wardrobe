export type ChatUserDto = {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  
  export type ChatListingDto = {
    id: string;
    title: string;
    image: string | null;
    transfer_type: string;
    status: string;
  };
  
  export type TransferStatus =
    | "confirmation_pending"
    | "waiting_second_confirmation"
    | "completed";
  
  export type TransferDto = {
    id: string;
    chat_id: string;
    listing_id: string;
    owner_id: string;
    recipient_id: string;
    status: TransferStatus;
    owner_confirmed: boolean;
    recipient_confirmed: boolean;
    current_user_confirmed: boolean | null;
    can_confirm: boolean | null;
    can_start: boolean | null;
    listing_status: string | null;
    completed_at: string | null;
    created_at: string;
  };
  
  export type ChatDto = {
    id: string;
    listing_id: string;
    owner_id: string;
    participant_id: string;
    listing: ChatListingDto;
    owner: ChatUserDto;
    participant: ChatUserDto;
    transfer: TransferDto | null;
    can_start_transfer: boolean;
    created_at: string;
  };
  
  export type ChatListItemDto = {
    id: string;
    listing_id: string;
    other_user: ChatUserDto;
    listing: ChatListingDto;
    last_message: {
      text: string;
      created_at: string;
      type: "text" | "system";
    } | null;
    unread_count: number;
    transfer_status: TransferStatus | null;
    created_at: string;
  };
  
  export type ChatListResponseDto = {
    items: ChatListItemDto[];
    total: number;
    page: number;
    page_size: number;
  };
  
  export type MessageDto = {
    id: string;
    chat_id: string | null;
    sender_id: string | null;
    type: "text" | "system";
    text: string;
    created_at: string;
  };
  
  export type MessageListResponseDto = {
    items: MessageDto[];
    total: number;
    page: number;
    page_size: number;
  };
  
  export type TransferHistoryItemDto = {
    id: string;
    transfer_id: string;
    listing_id: string;
    role: "owner" | "recipient";
    listing_title: string;
    counterpart_name: string;
    transfer_type: string;
    city: string;
    completed_at: string;
  };
  
  export type TransferHistoryResponseDto = {
    items: TransferHistoryItemDto[];
    total: number;
    page: number;
    page_size: number;
  };
  
  export type ChatMessage = {
    id: string;
    senderId: string | null;
    type: "text" | "system";
    text: string;
    createdAt: string;
  };
  
  export type ChatListItem = {
    id: string;
    listingId: string;
    otherUser: ChatUserDto;
    listing: ChatListingDto;
    lastMessage: ChatListItemDto["last_message"];
    unreadCount: number;
    transferStatus: TransferStatus | null;
  };
  
  export type Transfer = {
    id: string;
    chatId: string;
    listingId: string;
    ownerId: string;
    recipientId: string;
    status: TransferStatus;
    ownerConfirmed: boolean;
    recipientConfirmed: boolean;
    currentUserConfirmed: boolean | null;
    canConfirm: boolean | null;
    canStart: boolean | null;
    listingStatus: string | null;
    completedAt: string | null;
    createdAt: string;
  };
  
  export type ChatDetail = {
    id: string;
    listingId: string;
    ownerId: string;
    participantId: string;
    listing: ChatListingDto;
    owner: ChatUserDto;
    participant: ChatUserDto;
    transfer: Transfer | null;
    canStartTransfer: boolean;
    createdAt: string;
  };