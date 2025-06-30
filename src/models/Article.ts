import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
    title: string;
    content: string;
    summary?: string;
    imageUrl?: string;
    authorId: mongoose.Types.ObjectId;
    category?: string;
    tags: string[];
    isPublished: boolean;
    publishedAt?: Date;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const articleSchema = new Schema<IArticle>({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 500
    },
    content: {
        type: String,
        required: true,
        minlength: 1
    },
    summary: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    imageUrl: {
        type: String,
        trim: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'articles'
});

// Indexes
articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ authorId: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ isPublished: 1 });
articleSchema.index({ publishedAt: 1 });
articleSchema.index({ createdAt: -1 });

export const Article = mongoose.model<IArticle>('Article', articleSchema); 