import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from '../profile-page';
import { useAuth } from '@/hooks/use-auth';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', () => ({
  useRoute: vi.fn(),
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

// Mock the components
vi.mock('@/components/layout/app-layout', () => ({
  default: ({ children }) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('@/components/profile/profile-header', () => ({
  default: ({ user, stats, isOwnProfile }) => (
    <div data-testid="profile-header">
      <div data-testid="user-info">{user?.username}</div>
      <div data-testid="is-own-profile">{isOwnProfile ? 'true' : 'false'}</div>
    </div>
  ),
}));

vi.mock('@/components/profile/profile-stats', () => ({
  default: ({ user, stats }) => (
    <div data-testid="profile-stats">
      <div data-testid="user-stats">{user?.username}</div>
    </div>
  ),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render own profile when no userId param is provided', () => {
    // Mock current user
    const mockUser = { id: 1, username: 'testuser' };
    
    // Mock hooks
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, isLoading: false, error: null } as any);
    vi.mocked(useRoute).mockReturnValue([true, {}]);
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);
    
    render(<ProfilePage />);
    
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');
    expect(screen.getByTestId('is-own-profile')).toHaveTextContent('true');
  });

  it('should render another user profile when userId param is provided', () => {
    // Mock current user and other user
    const mockCurrentUser = { id: 1, username: 'testuser' };
    const mockOtherUser = { id: 2, username: 'otheruser' };
    
    // Mock hooks
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser, isLoading: false, error: null } as any);
    vi.mocked(useRoute).mockReturnValue([true, { userId: '2' }]);
    
    // Mock the queries
    vi.mocked(useQuery).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === '/api/users/2') {
        return {
          data: mockOtherUser,
          isLoading: false,
          error: null,
        };
      }
      return {
        data: null,
        isLoading: false,
        error: null,
      };
    });
    
    render(<ProfilePage />);
    
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-info')).toHaveTextContent('otheruser');
    expect(screen.getByTestId('is-own-profile')).toHaveTextContent('false');
  });
});