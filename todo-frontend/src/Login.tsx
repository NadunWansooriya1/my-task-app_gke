import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './config'; // <-- 1. ADD THIS IMPORT

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        // Create new account
        await axios.post(`${API_ENDPOINTS.AUTH}/register`, {
          name,
          email,
          username,
          password,
        });
        toast.success('Account created successfully! Please sign in.');
        // Switch to login mode after successful registration
        setIsSignup(false);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        // Login
        const { data } = await axios.post(`${API_ENDPOINTS.AUTH}/login`, {
          username,
          password,
        });
        toast.success('Welcome back!');
        onLoginSuccess(data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          (isSignup ? 'Failed to create account' : 'Invalid credentials')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError(null);
    setName('');
    setEmail('');
    setUsername('');
    setPassword('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100%',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #121827 50%, #0d1420 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        px: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 25% 35%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 65%, rgba(52, 211, 153, 0.06) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.05) 0%, transparent 60%)
          `,
          animation: 'ambientGlow 18s ease-in-out infinite',
          opacity: 1,
        },
        '@keyframes ambientGlow': {
          '0%, 100%': {
            opacity: 0.7,
            transform: 'scale(1) translateY(0)',
          },
          '50%': {
            opacity: 1,
            transform: 'scale(1.05) translateY(-10px)',
          },
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 4.5, md: 5.5 },
            borderRadius: { xs: 4, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(18, 24, 39, 0.65) 0%, rgba(15, 23, 42, 0.55) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(20, 184, 166, 0.2)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 10px 30px rgba(20, 184, 166, 0.12),
              inset 0 1px 1px rgba(20, 184, 166, 0.08),
              0 0 80px rgba(20, 184, 166, 0.08)
            `,
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.06), transparent)',
              animation: 'glassShimmer 4s infinite',
              pointerEvents: 'none',
            },
            '@keyframes glassShimmer': {
              '0%': { left: '-100%' },
              '100%': { left: '100%' },
            },
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-6px)' },
              boxShadow: `
                0 25px 70px rgba(0, 0, 0, 0.7),
                0 15px 40px rgba(20, 184, 166, 0.18),
                inset 0 1px 1px rgba(20, 184, 166, 0.12),
                0 0 100px rgba(20, 184, 166, 0.12)
              `,
              border: '1px solid rgba(20, 184, 166, 0.3)',
            },
          }}
        >
        <Box
          sx={{
            width: { xs: 75, sm: 85 },
            height: { xs: 75, sm: 85 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #2dd4bf 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 2.5, sm: 3 },
            boxShadow: `
              0 8px 28px rgba(20, 184, 166, 0.4),
              0 0 0 3px rgba(45, 212, 191, 0.2),
              inset 0 2px 8px rgba(45, 212, 191, 0.25),
              0 0 50px rgba(20, 184, 166, 0.25)
            `,
            border: '2px solid rgba(45, 212, 191, 0.25)',
            position: 'relative',
            animation: 'iconPulse 5s ease-in-out infinite',
            '@keyframes iconPulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                boxShadow: `
                  0 8px 28px rgba(20, 184, 166, 0.4),
                  0 0 0 3px rgba(45, 212, 191, 0.2),
                  inset 0 2px 8px rgba(45, 212, 191, 0.25),
                  0 0 50px rgba(20, 184, 166, 0.25)
                `,
              },
              '50%': {
                transform: 'scale(1.03)',
                boxShadow: `
                  0 10px 32px rgba(20, 184, 166, 0.5),
                  0 0 0 4px rgba(45, 212, 191, 0.25),
                  inset 0 2px 10px rgba(45, 212, 191, 0.3),
                  0 0 60px rgba(20, 184, 166, 0.35)
                `,
              },
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#ffffff',
              fontSize: { xs: '2.25rem', sm: '2.5rem' },
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.4)',
              fontWeight: 700,
            }}
          >
            ✓
          </Typography>
        </Box>
        <Typography
          component="h1"
          variant="h4"
          fontWeight={700}
          mb={1}
          sx={{
            color: '#ffffff',
            textShadow: '0 2px 16px rgba(20, 184, 166, 0.5), 0 1px 4px rgba(0, 0, 0, 0.4)',
            fontSize: { xs: '1.875rem', sm: '2.125rem', md: '2.25rem' },
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          {isSignup ? 'Create Account' : 'My Daily Task'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#a7f3d0',
            mb: { xs: 3, sm: 4 },
            textAlign: 'center',
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
            fontWeight: 400,
          }}
        >
          {isSignup
            ? 'Fill in your details to get started'
            : 'Sign in to continue to your tasks'}
        </Typography>
        <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
          {isSignup && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    borderRadius: { xs: 2.5, sm: 3 },
                    color: '#ffffff',
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
                    '& fieldset': {
                      borderColor: 'rgba(20, 184, 166, 0.25)',
                      borderWidth: '1px',
                    },
                    '&:hover': {
                      background: 'rgba(15, 23, 42, 0.6)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(20, 184, 166, 0.12)',
                      '& fieldset': {
                        borderColor: 'rgba(20, 184, 166, 0.35)',
                      },
                    },
                    '&.Mui-focused': {
                      background: 'rgba(15, 23, 42, 0.65)',
                      boxShadow: `
                        inset 0 1px 3px rgba(0, 0, 0, 0.1),
                        0 0 0 2px rgba(20, 184, 166, 0.2),
                        0 4px 12px rgba(20, 184, 166, 0.18)
                      `,
                      '& fieldset': {
                        borderColor: '#14b8a6',
                        borderWidth: '1.5px',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#5eead4',
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#99f6e4',
                      fontWeight: 600,
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    borderRadius: { xs: 2.5, sm: 3 },
                    color: '#ffffff',
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
                    '& fieldset': {
                      borderColor: 'rgba(20, 184, 166, 0.25)',
                      borderWidth: '1px',
                    },
                    '&:hover': {
                      background: 'rgba(15, 23, 42, 0.6)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(20, 184, 166, 0.12)',
                      '& fieldset': {
                        borderColor: 'rgba(20, 184, 166, 0.35)',
                      },
                    },
                    '&.Mui-focused': {
                      background: 'rgba(15, 23, 42, 0.65)',
                      boxShadow: `
                        inset 0 1px 3px rgba(0, 0, 0, 0.1),
                        0 0 0 2px rgba(20, 184, 166, 0.2),
                        0 4px 12px rgba(20, 184, 166, 0.18)
                      `,
                      '& fieldset': {
                        borderColor: '#14b8a6',
                        borderWidth: '1.5px',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#5eead4',
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#99f6e4',
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            autoComplete="username"
            autoFocus={!isSignup}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(12px) saturate(150%)',
                borderRadius: { xs: 2.5, sm: 3 },
                color: '#ffffff',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
                '& fieldset': {
                  borderColor: 'rgba(20, 184, 166, 0.25)',
                  borderWidth: '1px',
                },
                '&:hover': {
                  background: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(20, 184, 166, 0.12)',
                  '& fieldset': {
                    borderColor: 'rgba(20, 184, 166, 0.35)',
                  },
                },
                '&.Mui-focused': {
                  background: 'rgba(15, 23, 42, 0.65)',
                  boxShadow: `
                    inset 0 1px 3px rgba(0, 0, 0, 0.1),
                    0 0 0 2px rgba(20, 184, 166, 0.2),
                    0 4px 12px rgba(20, 184, 166, 0.18)
                  `,
                  '& fieldset': {
                    borderColor: '#14b8a6',
                    borderWidth: '1.5px',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: '#5eead4',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#99f6e4',
                  fontWeight: 600,
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(12px) saturate(150%)',
                borderRadius: { xs: 2.5, sm: 3 },
                color: '#ffffff',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
                '& fieldset': {
                  borderColor: 'rgba(20, 184, 166, 0.25)',
                  borderWidth: '1px',
                },
                '&:hover': {
                  background: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(20, 184, 166, 0.12)',
                  '& fieldset': {
                    borderColor: 'rgba(20, 184, 166, 0.35)',
                  },
                },
                '&.Mui-focused': {
                  background: 'rgba(15, 23, 42, 0.65)',
                  boxShadow: `
                    inset 0 1px 3px rgba(0, 0, 0, 0.1),
                    0 0 0 2px rgba(20, 184, 166, 0.2),
                    0 4px 12px rgba(20, 184, 166, 0.18)
                  `,
                  '& fieldset': {
                    borderColor: '#14b8a6',
                    borderWidth: '1.5px',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: '#5eead4',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#99f6e4',
                  fontWeight: 600,
                },
              },
            }}
          />
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                background: 'rgba(248, 113, 113, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(248, 113, 113, 0.3)',
                color: '#fecaca',
                borderRadius: { xs: 2, sm: 2.5 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                '& .MuiAlert-icon': {
                  color: '#fca5a5',
                },
              }}
            >
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 4 } }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                px: { xs: 6, sm: 8 },
                py: { xs: 1.3, sm: 1.4 },
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                borderRadius: 3,
                textTransform: 'none',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                fontWeight: 600,
                color: '#ffffff',
                boxShadow: `
                  0 6px 20px rgba(20, 184, 166, 0.4),
                  0 0 30px rgba(20, 184, 166, 0.2)
                `,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(45, 212, 191, 0.35)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: `
                    0 8px 28px rgba(20, 184, 166, 0.5),
                    0 0 40px rgba(20, 184, 166, 0.3)
                  `,
                  border: '1px solid rgba(45, 212, 191, 0.5)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(1)',
                },
                '&:disabled': {
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'rgba(148, 163, 184, 0.5)',
                  border: '1px solid rgba(20, 184, 166, 0.15)',
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
          <Box
            sx={{
              textAlign: 'center',
              mt: 3,
              mb: 1,
            }}
          >
            <Typography
              component="span"
              onClick={toggleMode}
              sx={{
                color: '#5eead4',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                '&:hover': {
                  color: '#2dd4bf',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textShadow: '0 0 10px rgba(20, 184, 166, 0.5)',
                },
              }}
            >
              {isSignup
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </Typography>
          </Box>
          {!isSignup && (
            <Box
              sx={{
                textAlign: 'center',
                mt: 2,
                mb: 1,
                px: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  fontWeight: 400,
                  display: 'block',
                  fontStyle: 'italic',
                }}
              >
                <Box component="span" sx={{ display: 'block', color: '#94a3b8', fontWeight: 600, fontStyle: 'normal' }}>
                  
                  {/* Requested demo banner text */}
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  {
                    ' Demo Users Only'
                  }
                </Box>
                <Box component="span" sx={{ display: 'block', color: '#94a3b8', mt: 0.25 }}>
                  Username: <Box component="span" sx={{ color: '#cbd5e1', fontWeight: 600 }}>admin</Box> | Password: <Box component="span" sx={{ color: '#cbd5e1', fontWeight: 600 }}>pass</Box>
                </Box>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default Login;