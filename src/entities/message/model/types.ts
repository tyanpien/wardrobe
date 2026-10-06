export type ChatParticipantType = "user" | "organization";

export type Chat = {
  id: string;
  firstParticipantId: string;
  firstParticipantType: ChatParticipantType;
  secondParticipantId: string;
  secondParticipantType: ChatParticipantType;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
};
