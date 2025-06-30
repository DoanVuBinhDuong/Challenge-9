import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    content: string;
    userId: mongoose.Types.ObjectId;
    articleId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 2000
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    articleId: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }
}, {
    timestamps: true,
    collection: 'comments'
});

// Indexes
commentSchema.index({ userId: 1 });
commentSchema.index({ articleId: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema); 