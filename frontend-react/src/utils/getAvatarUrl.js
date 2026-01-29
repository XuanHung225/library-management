const API_URL = import.meta.env.VITE_API_URL;

export const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl)
    return "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";
  return `${API_URL}${avatarUrl}`;
};
