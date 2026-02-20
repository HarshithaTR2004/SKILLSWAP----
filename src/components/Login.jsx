// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { auth, provider } from '../firebase';
// import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
// import patternImg from '../pattern.png';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       navigate('/home');
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       await signInWithPopup(auth, provider);
//       navigate('/home');
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const styles = {
//     container: {
//       display: 'flex',
//       height: '100vh',
//       fontFamily: 'Segoe UI, sans-serif',
//     },
//     left: {
//       flex: 1,
//       padding: '80px 60px',
//       backgroundColor: '#fff',
//       display: 'flex',
//       flexDirection: 'column',
//       justifyContent: 'center',
//     },
//     right: {
//       flex: 1,
//       background: `url(${patternImg}) no-repeat center`,
//       backgroundSize: 'contain',
//     },
//     logo: {
//       fontSize: '32px',
//       fontWeight: 'bold',
//       marginBottom: '20px',
//       color: '#333',
//     },
//     logoSpan: {
//       color: '#23a8ff',
//     },
//     heading: {
//       fontSize: '22px',
//       marginBottom: '20px',
//     },
//     googleBtn: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       background: '#f2f8fb',
//       border: 'none',
//       borderRadius: '8px',
//       padding: '12px',
//       cursor: 'pointer',
//       marginBottom: '16px',
//       fontWeight: 600,
//     },
//     googleIcon: {
//       marginRight: '10px',
//     },
//     divider: {
//       textAlign: 'center',
//       margin: '10px 0 20px',
//       color: '#999',
//     },
//     form: {
//       display: 'flex',
//       flexDirection: 'column',
//     },
//     label: {
//       margin: '10px 0 5px',
//       fontWeight: 600,
//     },
//     input: {
//       padding: '12px',
//       border: '1px solid #ddd',
//       borderRadius: '8px',
//       marginBottom: '10px',
//       fontSize: '14px',
//     },
//     submitBtn: {
//       marginTop: '10px',
//       backgroundColor: '#222',
//       color: '#fff',
//       padding: '12px',
//       border: 'none',
//       borderRadius: '8px',
//       fontWeight: 600,
//       cursor: 'pointer',
//     },
//     disclaimer: {
//       marginTop: '15px',
//       fontSize: '12px',
//       color: '#666',
//     },
//     loginLink: {
//       marginTop: '10px',
//       fontSize: '13px',
//     },
//     link: {
//       color: '#23a8ff',
//       textDecoration: 'none',
//       fontWeight: 'bold',
//     },
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.left}>
//         <h1 style={styles.logo}>
//           Skill<span style={styles.logoSpan}>Swap</span>
//         </h1>
//         <h2 style={styles.heading}>Create an account</h2>

//         <button style={styles.googleBtn} onClick={handleGoogleLogin}>
//           <img
//             src="https://img.icons8.com/color/16/000000/google-logo.png"
//             alt="Google"
//             style={styles.googleIcon}
//           />
//           Sign up with Google
//         </button>

//         <div style={styles.divider}>Or use Email</div>

//         <form style={styles.form} onSubmit={handleSignUp}>
//           <label style={styles.label}>Email</label>
//           <input
//             type="email"
//             placeholder="name@email.com"
//             style={styles.input}
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <label style={styles.label}>Password</label>
//           <input
//             type="password"
//             placeholder="••••••••"
//             style={styles.input}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button type="submit" style={styles.submitBtn}>
//             GET STARTED →
//           </button>
//         </form>

//         <p style={styles.disclaimer}>
//           By signing up to SkillSwap, you agree to our{' '}
//           <a href="#" style={styles.link}>Privacy Policy</a> and{' '}
//           <a href="#" style={styles.link}>Terms of Service</a>.
//         </p>

//         <p style={styles.loginLink}>
//           Already a Member?{' '}
//           <Link to="/" style={styles.link}>LOG IN</Link>
//         </p>
//       </div>
//       <div style={styles.right} />
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, provider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import patternImg from '../pattern.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      fontFamily: 'Segoe UI, sans-serif',
    },
    left: {
      flex: 1,
      padding: '80px 60px',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    right: {
      flex: 1,
      background: `url(${patternImg}) no-repeat center`,
      backgroundSize: 'contain',
    },
    logo: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
    },
    logoSpan: {
      color: '#23a8ff',
    },
    heading: {
      fontSize: '22px',
      marginBottom: '20px',
    },
    googleBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f2f8fb',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      cursor: 'pointer',
      marginBottom: '16px',
      fontWeight: 600,
    },
    googleIcon: {
      marginRight: '10px',
    },
    divider: {
      textAlign: 'center',
      margin: '10px 0 20px',
      color: '#999',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      margin: '10px 0 5px',
      fontWeight: 600,
    },
    input: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '10px',
      fontSize: '14px',
    },
    submitBtn: {
      marginTop: '10px',
      backgroundColor: '#222',
      color: '#fff',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    disclaimerNote: {
      marginBottom: '16px',
      fontSize: '12px',
      color: 'gray',
    },
    disclaimer: {
      marginTop: '15px',
      fontSize: '12px',
      color: '#666',
    },
    loginLink: {
      marginTop: '10px',
      fontSize: '13px',
    },
    link: {
      color: '#23a8ff',
      textDecoration: 'none',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h1 style={styles.logo}>
          Skill<span style={styles.logoSpan}>Swap</span>
        </h1>
        <h2 style={styles.heading}>Create an account</h2>

        <p style={styles.disclaimerNote}>
          🔒 This is a student project. Not affiliated with Google or any real service.
        </p>

        <button style={styles.googleBtn} onClick={handleGoogleLogin}>
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="Google"
            style={styles.googleIcon}
          />
          Sign up with Google
        </button>

        <div style={styles.divider}>Or use Email</div>

        <form style={styles.form} onSubmit={handleSignUp}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="name@email.com"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={styles.submitBtn}>
            GET STARTED →
          </button>
        </form>

        <p style={styles.disclaimer}>
          By signing up to SkillSwap, you agree to our{' '}
          <a href="#" style={styles.link}>Privacy Policy</a> and{' '}
          <a href="#" style={styles.link}>Terms of Service</a>.
        </p>

        <p style={styles.loginLink}>
          Already a Member?{' '}
          <Link to="/" style={styles.link}>LOG IN</Link>
        </p>
      </div>
      <div style={styles.right} />
    </div>
  );
};

export default Login;
