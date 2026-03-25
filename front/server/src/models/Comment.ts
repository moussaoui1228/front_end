import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    user_id: mongoose.Types.ObjectId;
    content: string;
    rating: number;
    created_at: Date;
}

const CommentSchema = new Schema<IComment>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    created_at: { type: Date, default: Date.now },
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
