export const DEFAULT_PROFILE_IMAGE = '/default-profile.svg'

export function getProfileImageUrl(profileImage) {
  return profileImage || DEFAULT_PROFILE_IMAGE
}
