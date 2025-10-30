import { Schema, models, model, Types, Document } from "mongoose";

export interface IChat {
  author: Types.ObjectId;
  title: string;
  messages: Array<{
    sender: string;
    content: string;
    timestamp: Date;
    imageUrl?: string;
    detectedDisease?: string;
  }>;
}

export interface IChatDoc extends IChat, Document {}

const ChatSchema = new Schema<IChat>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Chat" },
    messages: [
      {
        sender: { type: String, enum: ["user", "ai"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        imageUrl: { type: String },
        detectedDisease: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Chat = models?.Chat || model<IChat>("Chat", ChatSchema);

export default Chat;
