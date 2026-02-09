import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type BookMetadata = {
    id : Text;
    title : Text;
    summary : Text;
    genre : Text;
    sortOrder : Nat;
    coverImage : Storage.ExternalBlob;
  };

  type BookAsset = {
    id : Text;
    bookFile : Storage.ExternalBlob;
    coverImage : Storage.ExternalBlob;
    fileType : BookFileType;
  };

  type CharacterNote = {
    id : Text;
    bookId : Text;
    title : Text;
    description : Text;
    file : ?Storage.ExternalBlob;
    fileType : ?CharacterNoteFileType;
    previewImage : ?Storage.ExternalBlob;
  };

  type BlogPost = {
    id : Text;
    title : Text;
    description : Text;
    file : ?Storage.ExternalBlob;
    fileType : ?BlogFileType;
    previewImage : ?Storage.ExternalBlob;
  };

  type NewComing = {
    id : Text;
    title : Text;
    description : Text;
    image : Storage.ExternalBlob;
    releaseDate : ?Text;
    sortOrder : Nat;
  };

  type SiteAssets = {
    authorPhoto : Storage.ExternalBlob;
    logo : Storage.ExternalBlob;
  };

  type BookFileType = { #pdf; #wordDoc; #wordDocx };
  type CharacterNoteFileType = { #pdf; #image; #video };
  type BlogFileType = { #pdf; #image; #video };

  type UserProfile = {
    name : Text;
    email : Text;
    gender : ?Text;
    bestReads : ?Text;
    profilePicture : ?Storage.ExternalBlob;
    welcomeMessageShown : Bool;
  };

  type PublicUserProfile = {
    name : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  type BookRating = {
    userId : Principal.Principal;
    userName : Text;
    rating : Nat;
    timestamp : Int;
  };

  type BookComment = {
    commentId : Text;
    userId : Principal.Principal;
    userName : Text;
    comment : Text;
    timestamp : Int;
    likeCount : Nat;
  };

  type CommentLike = {
    commentId : Text;
    userId : Principal.Principal;
    timestamp : Int;
  };

  type ForumThread = {
    threadId : Text;
    authorId : Principal.Principal;
    authorName : Text;
    authorAvatar : ?Storage.ExternalBlob;
    title : Text;
    message : Text;
    timestamp : Int;
    replyCount : Nat;
    replies : [ForumReply];
  };

  type ForumReply = {
    replyId : Text;
    threadId : Text;
    authorId : Principal.Principal;
    authorName : Text;
    authorAvatar : ?Storage.ExternalBlob;
    message : Text;
    timestamp : Int;
  };

  type NotificationType = { #comment; #rating; #feedback };

  type AdminNotification = {
    id : Text;
    notificationType : NotificationType;
    bookTitle : Text;
    userName : Text;
    timestamp : Int;
    isRead : Bool;
  };

  // Old actor type
  type OldActor = {
    adminUsername : Text;
    adminPassword : Text;
    isAdminSessionActive : Bool;
    lastAdminSessionPrincipal : ?Principal.Principal;
    siteAssets : ?SiteAssets;
    books : Map.Map<Text, BookMetadata>;
    bookAssets : Map.Map<Text, BookAsset>;
    characterNotes : Map.Map<Text, CharacterNote>;
    blogPosts : Map.Map<Text, BlogPost>;
    newComings : Map.Map<Text, NewComing>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    bookComments : Map.Map<Text, [BookComment]>;
    bookRatings : Map.Map<Text, [BookRating]>;
    forumThreads : Map.Map<Text, ForumThread>;
    forumReplies : Map.Map<Text, ForumReply>;
    commentLikes : Map.Map<Text, [CommentLike]>;
    adminNotifications : Map.Map<Text, AdminNotification>;
  };

  // New actor type (same as old)
  type NewActor = {
    adminUsername : Text;
    adminPassword : Text;
    isAdminSessionActive : Bool;
    lastAdminSessionPrincipal : ?Principal.Principal;
    accessControlInitialized : Bool;
    siteAssets : ?SiteAssets;
    books : Map.Map<Text, BookMetadata>;
    bookAssets : Map.Map<Text, BookAsset>;
    characterNotes : Map.Map<Text, CharacterNote>;
    blogPosts : Map.Map<Text, BlogPost>;
    newComings : Map.Map<Text, NewComing>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    bookComments : Map.Map<Text, [BookComment]>;
    bookRatings : Map.Map<Text, [BookRating]>;
    forumThreads : Map.Map<Text, ForumThread>;
    forumReplies : Map.Map<Text, ForumReply>;
    commentLikes : Map.Map<Text, [CommentLike]>;
    adminNotifications : Map.Map<Text, AdminNotification>;
  };

  public func run(old : OldActor) : NewActor {
    { old with accessControlInitialized = false };
  };
};
