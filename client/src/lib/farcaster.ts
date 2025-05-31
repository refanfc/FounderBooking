// Farcaster Frame utilities and integration

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
}

export interface FrameMetadata {
  image: string;
  postUrl: string;
  inputText?: string;
  buttons: Array<{
    text: string;
    action?: string;
    target?: string;
  }>;
}

// Mock Farcaster user data for development
export const mockFarcasterUser: FarcasterUser = {
  fid: 3,
  username: "dwr.eth",
  displayName: "Dan Romero",
  profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
  bio: "Co-founder of Farcaster. Product strategy, protocol design, and building consumer crypto products.",
};

// Generate Frame metadata for creator booking
export const generateCreatorFrame = (creator: any): FrameMetadata => {
  const baseUrl = window.location.origin;
  
  return {
    image: `${baseUrl}/api/frame/creator/${creator.id}/image`,
    postUrl: `${baseUrl}/api/frame/creator/${creator.id}/book`,
    buttons: [
      { text: "View Profile" },
      { text: `Book for $${(creator.rate / 100).toFixed(0)}` },
      { text: "Share" }
    ]
  };
};

// Generate Frame metadata for booking confirmation
export const generateBookingFrame = (booking: any): FrameMetadata => {
  const baseUrl = window.location.origin;
  
  return {
    image: `${baseUrl}/api/frame/booking/${booking.id}/image`,
    postUrl: `${baseUrl}/api/frame/booking/${booking.id}/confirm`,
    buttons: [
      { text: "Join Call", action: "link", target: booking.meetingUrl },
      { text: "Reschedule" },
      { text: "Cancel" }
    ]
  };
};

// Validate Farcaster Frame signature
export const validateFrameSignature = (signature: string, data: any): boolean => {
  // In a real implementation, this would validate the Frame signature
  // against Farcaster's public key
  return true;
};

// Extract user data from Farcaster Frame
export const extractFrameUser = (frameData: any): FarcasterUser | null => {
  try {
    return {
      fid: frameData.untrustedData.fid,
      username: frameData.trustedData.messageBytes.username,
      displayName: frameData.trustedData.messageBytes.displayName,
      profileImage: frameData.trustedData.messageBytes.pfpUrl,
      bio: frameData.trustedData.messageBytes.profile?.bio?.text,
    };
  } catch (error) {
    console.error("Error extracting Frame user data:", error);
    return null;
  }
};

// Generate Frame HTML for embedding
export const generateFrameHTML = (metadata: FrameMetadata): string => {
  const buttons = metadata.buttons
    .map((button, index) => {
      const actionMeta = button.action ? `<meta name="fc:frame:button:${index + 1}:action" content="${button.action}" />` : '';
      const targetMeta = button.target ? `<meta name="fc:frame:button:${index + 1}:target" content="${button.target}" />` : '';
      return `
        <meta name="fc:frame:button:${index + 1}" content="${button.text}" />
        ${actionMeta}
        ${targetMeta}
      `;
    })
    .join('');

  return `
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${metadata.image}" />
    <meta name="fc:frame:post_url" content="${metadata.postUrl}" />
    ${metadata.inputText ? `<meta name="fc:frame:input:text" content="${metadata.inputText}" />` : ''}
    ${buttons}
  `;
};
