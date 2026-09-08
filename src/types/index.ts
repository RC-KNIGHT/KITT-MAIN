export interface EcosystemProduct {
  id: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  url: string;
  category: 'Autonomous AI' | '3D & Simulation' | 'Digital Logic' | 'Foundations & Math';
  status: 'Live' | 'Active' | 'Beta';
  badge: string;
  iconName: string;
  accentColor: string;
  capabilities: string[];
  roleInEcosystem: string;
  targetAudience: string;
  demoMetrics: {
    label: string;
    value: string;
  }[];
}

export interface CommunityProject {
  id: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
    role: string;
  };
  category: 'IoT & Sensors' | 'Digital Logic' | 'Arduino / MCU' | 'Robotics' | 'Power & Analog';
  description: string;
  tags: string[];
  likes: number;
  isLiked?: boolean;
  userRating?: number;
  rating: number;
  ratingCount: number;
  commentsCount: number;
  views: number;
  forkCount: number;
  hardwareList: string[];
  previewGradient: string;
  comments: {
    id: string;
    author: string;
    avatar: string;
    date: string;
    text: string;
    likes: number;
  }[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  rating: number;
  avatar: string;
  badge: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  badge?: string;
  isPopular?: boolean;
  aiCredits: string;
  features: string[];
  ctaText: string;
  buttonVariant: 'primary' | 'secondary' | 'accent';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Intermediate' | 'Pro Engineer';
  aiCreditsRemaining: number;
  aiCreditsTotal: number;
  savedProjects: {
    id: string;
    title: string;
    category: string;
    updatedAt: string;
  }[];
}
