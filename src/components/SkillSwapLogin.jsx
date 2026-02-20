// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
// import { auth, provider } from '../firebase';
// import patternImg from '../pattern.png';

// const SkillSwapLogin = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ email: '', password: '' });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, formData.email, formData.password);
//       navigate('/home');
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       await signInWithPopup(auth, provider);
//       navigate('/home');
//     } catch (error) {
//       alert(`Google Sign-In Error: ${error.message}`);
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
//       backgroundColor: 'white',
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
//       color: 'white',
//       padding: '12px',
//       border: 'none',
//       borderRadius: '8px',
//       fontWeight: 600,
//       cursor: 'pointer',
//     },
//     signupPrompt: {
//       marginTop: '20px',
//       fontSize: '14px',
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
//         <h2 style={styles.heading}>Log in to your account</h2>

//         <button onClick={handleGoogleSignIn} style={styles.googleBtn}>
//           <img
//             src="https://img.icons8.com/color/16/000000/google-logo.png"
//             alt="Google"
//             style={styles.googleIcon}
//           />
//           Sign in with Google
//         </button>

//         <form onSubmit={handleSubmit} style={styles.form}>
//           <label style={styles.label}>Email</label>
//           <input
//             name="email"
//             type="email"
//             placeholder="Email"
//             required
//             value={formData.email}
//             onChange={handleInputChange}
//             style={styles.input}
//           />

//           <label style={styles.label}>Password</label>
//           <input
//             name="password"
//             type="password"
//             placeholder="Password"
//             required
//             value={formData.password}
//             onChange={handleInputChange}
//             style={styles.input}
//           />

//           <button type="submit" style={styles.submitBtn}>Sign In</button>
//         </form>

//         <p style={styles.signupPrompt}>
//           Don’t have an account?{' '}
//           <Link to="/signup" style={styles.link}>SIGN UP</Link>
//         </p>
//       </div>

//       <div style={styles.right}></div>
//     </div>
//   );
// };

// export default SkillSwapLogin;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import patternImg from '../pattern.png';

const SkillSwapLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (error) {
      alert(`Google Sign-In Error: ${error.message}`);
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
      backgroundColor: 'white',
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
      marginBottom: '10px',
    },
    disclaimer: {
      fontSize: '12px',
      color: 'gray',
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
      color: 'white',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    signupPrompt: {
      marginTop: '20px',
      fontSize: '14px',
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
        <h2 style={styles.heading}>Log in to your account</h2>

        <p style={styles.disclaimer}>
          🔒 This is a student project. Not affiliated with Google or any real service.
        </p>

        <button onClick={handleGoogleSignIn} style={styles.googleBtn}>
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="Google"
            style={styles.googleIcon}
          />
          Sign in with Google
        </button>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleInputChange}
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleInputChange}
            style={styles.input}
          />

          <button type="submit" style={styles.submitBtn}>Sign In</button>
        </form>

        <p style={styles.signupPrompt}>
          Don’t have an account?{' '}
          <Link to="/signup" style={styles.link}>SIGN UP</Link>
        </p>
      </div>

      <div style={styles.right}></div>
    </div>
  );
};

export default SkillSwapLogin;
