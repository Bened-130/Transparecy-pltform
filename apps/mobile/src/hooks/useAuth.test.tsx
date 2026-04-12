import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from './useAuth';

describe('useAuth Hook', () => {
  test('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  test('should have auth reducer with correct initial state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.state).toHaveProperty('user');
    expect(result.current.state).toHaveProperty('token');
    expect(result.current.state).toHaveProperty('isAuthenticated');
  });

  test('should handle login action', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      result.current.dispatch({
        type: 'LOGIN',
        payload: { user: { id: '1', phone: '+254712345678' }, token: 'test-token' },
      });
    });

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.user?.phone).toBe('+254712345678');
  });

  test('should handle logout action', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      result.current.dispatch({ type: 'LOGOUT' });
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
  });

  test('should handle error state', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: 'Authentication failed',
      });
    });

    expect(result.current.state.error).toBe('Authentication failed');
  });
});
