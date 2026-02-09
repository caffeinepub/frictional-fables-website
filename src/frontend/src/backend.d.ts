import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface BookAsset {
    id: string;
    bookFile: ExternalBlob;
    fileType: BookFileType;
    coverImage: ExternalBlob;
}
export interface BlogPost {
    id: string;
    previewImage?: ExternalBlob;
    title: string;
    file?: ExternalBlob;
    description: string;
    fileType?: BlogFileType;
}
export interface ForumReply {
    authorAvatar?: ExternalBlob;
    authorId: Principal;
    authorName: string;
    message: string;
    timestamp: bigint;
    replyId: string;
    threadId: string;
}
export interface CharacterNote {
    id: string;
    previewImage?: ExternalBlob;
    title: string;
    file?: ExternalBlob;
    description: string;
    bookId: string;
    fileType?: CharacterNoteFileType;
}
export interface BookComment {
    userName: string;
    likeCount: bigint;
    commentId: string;
    userId: Principal;
    comment: string;
    timestamp: bigint;
}
export interface ForumThread {
    title: string;
    authorAvatar?: ExternalBlob;
    authorId: Principal;
    authorName: string;
    message: string;
    timestamp: bigint;
    replyCount: bigint;
    replies: Array<ForumReply>;
    threadId: string;
}
export interface BookRating {
    userName: string;
    userId: Principal;
    timestamp: bigint;
    rating: bigint;
}
export interface PublicUserProfile {
    name: string;
    profilePicture?: ExternalBlob;
}
export interface SiteAssets {
    logo: ExternalBlob;
    authorPhoto: ExternalBlob;
}
export interface BookMetadata {
    id: string;
    title: string;
    sortOrder: bigint;
    coverImage: ExternalBlob;
    summary: string;
    genre: string;
}
export interface NewComing {
    id: string;
    title: string;
    sortOrder: bigint;
    description: string;
    image: ExternalBlob;
    releaseDate?: string;
}
export interface UserProfile {
    name: string;
    email: string;
    welcomeMessageShown: boolean;
    gender?: string;
    profilePicture?: ExternalBlob;
    bestReads?: string;
}
export enum BookFileType {
    pdf = "pdf",
    wordDoc = "wordDoc",
    wordDocx = "wordDocx"
}
export enum CharacterNoteFileType {
    pdf = "pdf",
    video = "video",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBlogPost(id: string, title: string, description: string, file: ExternalBlob | null, fileType: BlogFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    addBook(id: string, title: string, summary: string, genre: string, sortOrder: bigint, coverImage: ExternalBlob): Promise<void>;
    addBookComment(bookId: string, comment: string): Promise<void>;
    addBookRating(bookId: string, rating: bigint): Promise<void>;
    addCharacterNote(id: string, bookId: string, title: string, description: string, file: ExternalBlob | null, fileType: CharacterNoteFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    addNewComing(id: string, title: string, description: string, image: ExternalBlob, releaseDate: string | null, sortOrder: bigint): Promise<void>;
    adminLogin(username: string, password: string): Promise<boolean>;
    adminLogout(): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkProfileComplete(): Promise<boolean>;
    countRepliesByThread(threadId: string): Promise<bigint>;
    createThread(title: string, message: string): Promise<void>;
    deleteBlogPost(id: string): Promise<void>;
    deleteBook(id: string): Promise<void>;
    deleteCharacterNote(id: string): Promise<void>;
    deleteNewComing(id: string): Promise<void>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllBooks(): Promise<Array<BookMetadata>>;
    getAllCharacterNotes(): Promise<Array<CharacterNote>>;
    getAllNewComings(): Promise<Array<NewComing>>;
    getAllThreadsWithReplies(): Promise<Array<ForumThread>>;
    getBlogPost(id: string): Promise<BlogPost | null>;
    getBook(id: string): Promise<BookMetadata | null>;
    getBookAssets(bookId: string): Promise<BookAsset | null>;
    getBookAverageRating(bookId: string): Promise<number | null>;
    getBookComments(bookId: string): Promise<Array<BookComment>>;
    getBookRatings(bookId: string): Promise<Array<BookRating>>;
    getBooksInFeaturedOrder(): Promise<Array<BookMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacterNote(id: string): Promise<CharacterNote | null>;
    getCharacterNotesByBook(bookId: string): Promise<Array<CharacterNote>>;
    getCommentLikeCount(commentId: string): Promise<bigint>;
    getNewComing(id: string): Promise<NewComing | null>;
    getPublicUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    getRepliesByThread(threadId: string): Promise<Array<ForumReply>>;
    getReplyById(replyId: string): Promise<ForumReply | null>;
    getSiteAssets(): Promise<SiteAssets | null>;
    getThreadWithReplies(threadId: string): Promise<ForumThread | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCurrentSessionAdmin(): Promise<boolean>;
    likeComment(commentId: string): Promise<void>;
    replyToThread(threadId: string, message: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBlogPost(id: string, title: string, description: string, file: ExternalBlob | null, fileType: BlogFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    updateBook(id: string, title: string, summary: string, genre: string, sortOrder: bigint, coverImage: ExternalBlob): Promise<void>;
    updateCharacterNote(id: string, bookId: string, title: string, description: string, file: ExternalBlob | null, fileType: CharacterNoteFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    updateNewComing(id: string, title: string, description: string, image: ExternalBlob, releaseDate: string | null, sortOrder: bigint): Promise<void>;
    uploadAuthorPhoto(photo: ExternalBlob): Promise<void>;
    uploadBookCover(bookId: string, image: ExternalBlob): Promise<void>;
    uploadBookFile(bookId: string, file: ExternalBlob, fileType: BookFileType): Promise<void>;
    uploadLogo(logo: ExternalBlob): Promise<void>;
}
