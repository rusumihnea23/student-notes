export default function Navbar() {
  return (
    <nav className="navbar navbar-dark bg-dark" style={styles.nav}>
      <div style={styles.logo}>Student Notes </div>
      <div style={styles.links}>
        <button style={styles.btn}>Home</button>
        <button style={styles.btn}>About</button>
        <button style={styles.btn}>My Account</button>

        
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: '#333',
    color: 'white',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    gap: '10px'
  },
  btn: {
    padding: '8px 16px',
    cursor: 'pointer',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px'
  }
};