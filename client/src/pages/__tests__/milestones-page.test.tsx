import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import MilestonesPage from '../milestones-page';

// Mock the auth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser', role: 'user' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the milestone display component
jest.mock('@/components/milestones/milestone-display', () => ({
  __esModule: true,
  default: ({ userId }: { userId: number }) => (
    <div data-testid="milestone-display">Milestone Display for user {userId}</div>
  ),
}));

// Mock the layout component
jest.mock('@/components/layout/app-layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

describe('MilestonesPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders the milestones page with correct elements', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MilestonesPage />
        </AuthProvider>
      </QueryClientProvider>
    );

    // Check for page title
    expect(screen.getByText('Achievement Milestones')).toBeInTheDocument();
    
    // Check for milestone display component
    expect(screen.getByTestId('milestone-display')).toBeInTheDocument();
    
    // Check for category cards
    expect(screen.getByText('Challenge Badges')).toBeInTheDocument();
    expect(screen.getByText('Category Badges')).toBeInTheDocument();
    expect(screen.getByText('Difficulty Badges')).toBeInTheDocument();
    expect(screen.getByText('Point Badges')).toBeInTheDocument();
    
    // Check for description text
    expect(screen.getByText(/Track your progress towards earning badges/i)).toBeInTheDocument();
  });
});