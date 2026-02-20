import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, where, orderBy
} from 'firebase/firestore';
import {
  FiBookOpen, FiCalendar, FiCheckCircle, FiHome, FiPlay, FiPause,
  FiRotateCcw, FiTrash2, FiEdit3, FiMenu, FiFileText
} from 'react-icons/fi';
import { useAuthState } from 'react-firebase-hooks/auth';

const MyLearning = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [datesWithNotes, setDatesWithNotes] = useState(new Set());
  const [todo, setTodo] = useState([]);
  const [task, setTask] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [date, setDate] = useState(new Date());
  const [eventNote, setEventNote] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('default');
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      alert('Pomodoro session completed!');
    }
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timeLeft]);

  useEffect(() => {
    if (user) {
      fetchDatesWithNotes();
      fetchTodos();
      fetchEventNote();
      fetchAllNotes();
    }
  }, [user, date]);

  const fetchAllNotes = async () => {
    const notesRef = collection(db, 'users', user.uid, 'learning');
    const q = query(notesRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllNotes(all);
  };

  const fetchDatesWithNotes = async () => {
    const notesRef = collection(db, 'users', user.uid, 'learning');
    const snapshot = await getDocs(notesRef);
    const allDates = new Set();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.date) allDates.add(data.date);
    });
    setDatesWithNotes(allDates);
  };

  const fetchTodos = async () => {
    const todosRef = collection(db, 'users', user.uid, 'todos');
    const q = query(todosRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const todoArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTodo(todoArray);
  };

  const fetchEventNote = async () => {
    const eventsRef = collection(db, 'users', user.uid, 'events');
    const q = query(eventsRef, where('date', '==', date.toDateString()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const note = snapshot.docs[0].data().note;
      setEventNote(note);
    } else {
      setEventNote('');
    }
  };

  const handleSaveNotes = async () => {
    if (!title || !notes) return alert('Please enter both title and notes');
    try {
      if (editId) {
        await updateDoc(doc(db, 'users', user.uid, 'learning', editId), {
          title, notes, date: date.toDateString(), timestamp: serverTimestamp()
        });
        alert('Note updated!');
      } else {
        await addDoc(collection(db, 'users', user.uid, 'learning'), {
          title, notes, date: date.toDateString(), timestamp: serverTimestamp()
        });
        alert('Note saved!');
      }
      setTitle('');
      setNotes('');
      setEditId(null);
      fetchAllNotes();
      fetchDatesWithNotes();
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'learning', id));
    fetchAllNotes();
    fetchDatesWithNotes();
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setNotes(note.notes);
    setEditId(note.id);
    setActiveTab('default');
  };

  const handleAddTask = async () => {
    if (!task.trim()) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'todos'), {
        task,
        done: false,
        timestamp: serverTimestamp()
      });
      setTodo([{ id: docRef.id, task, done: false }, ...todo]);
      setTask('');
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const toggleTask = async (index) => {
    const item = todo[index];
    const updated = [...todo];
    updated[index].done = !item.done;
    setTodo(updated);
    await updateDoc(doc(db, 'users', user.uid, 'todos', item.id), {
      done: !item.done
    });
  };

  const deleteTask = async (index) => {
    const item = todo[index];
    await deleteDoc(doc(db, 'users', user.uid, 'todos', item.id));
    const updated = todo.filter((_, i) => i !== index);
    setTodo(updated);
  };

  const handleEventSave = async () => {
    try {
      const eventsRef = collection(db, 'users', user.uid, 'events');
      const q = query(eventsRef, where('date', '==', date.toDateString()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(eventsRef, {
          date: date.toDateString(),
          note: eventNote,
          timestamp: serverTimestamp()
        });
      } else {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(db, 'users', user.uid, 'events', docId), {
          note: eventNote,
          timestamp: serverTimestamp()
        });
      }
      alert('Event note saved!');
      fetchEventNote();
    } catch (err) {
      console.error('Failed to save event note:', err);
    }
  };

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const tileContent = ({ date, view }) => {
    if (view === 'month' && datesWithNotes.has(date.toDateString())) {
      return <div style={{ textAlign: 'center', color: '#0EA5E9' }}>•</div>;
    }
  };

  const styles = {
    container: { display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI' },
    sidebar: {
      width: sidebarOpen ? 200 : 50,
      backgroundColor: '#4B5563',
      color: '#fff',
      padding: 10,
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20
    },
    sidebarButton: {
      backgroundColor: '#0EA5E9',
      border: 'none',
      color: '#fff',
      padding: '10px 15px',
      borderRadius: 8,
      cursor: 'pointer',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      transition: '0.3s',
      fontWeight: 'bold',
      justifyContent: 'center'
    },
    content: { flex: 1, display: 'flex' },
    left: { flex: 2, padding: 40, backgroundColor: '#F5F5F5' },
    right: { flex: 1, padding: 40, backgroundColor: '#FFF', borderLeft: '4px solid #4B5563' },
    input: { width: '100%', padding: 10, margin: '10px 0', borderRadius: 8, border: '1px solid #ccc' },
    textarea: { width: '100%', padding: 10, height: 100, borderRadius: 8, border: '1px solid #ccc' },
    button: {
      padding: '10px 16px', backgroundColor: '#0EA5E9', color: '#fff',
      border: 'none', borderRadius: 8, cursor: 'pointer',
      marginTop: 10, display: 'flex', alignItems: 'center', gap: 6
    },
    todoItem: (done) => ({
      textDecoration: done ? 'line-through' : 'none',
      padding: 10, marginBottom: 8, borderRadius: 6,
      backgroundColor: done ? '#d1fae5' : '#f9fafb',
      display: 'flex', justifyContent: 'space-between',
      cursor: 'pointer'
    }),
    timerContainer: {
      backgroundColor: '#EF4444', color: '#fff',
      borderRadius: 10, padding: 30, textAlign: 'center', marginBottom: 20
    },
    timer: { fontSize: 48, fontWeight: 'bold' },
    eventBox: {
      backgroundColor: '#f3f4f6', borderLeft: '5px solid #4B5563',
      padding: 15, borderRadius: 10, marginBottom: 20
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.sidebarButton}><FiMenu /></button>
        <button onClick={() => navigate('/home')} style={styles.sidebarButton}><FiHome /> {sidebarOpen && 'Home'}</button>
        <button onClick={() => setActiveTab('default')} style={styles.sidebarButton}><FiBookOpen /> {sidebarOpen && 'Learning'}</button>
        <button onClick={() => setActiveTab('allNotes')} style={styles.sidebarButton}><FiFileText /> {sidebarOpen && 'Notes'}</button>
      </div>

      <div style={styles.content}>
        {activeTab === 'allNotes' ? (
          <div style={{ ...styles.left, width: '100%' }}>
            <h2><FiFileText /> All Notes</h2>
            {allNotes.length === 0 ? <p>No saved notes.</p> : allNotes.map(note => (
              <div key={note.id} style={styles.eventBox}>
                <h4>{note.title} - <small>{note.date}</small></h4>
                <p>{note.notes}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={styles.button} onClick={() => handleEdit(note)}><FiEdit3 /> Edit</button>
                  <button style={{ ...styles.button, backgroundColor: '#EF4444' }} onClick={() => handleDelete(note.id)}><FiTrash2 /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={styles.left}>
              <h2><FiBookOpen /> My Learning</h2>
              <input style={styles.input} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea style={styles.textarea} placeholder="Your notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              <button style={styles.button} onClick={handleSaveNotes}>
                <FiCheckCircle /> {editId ? 'Update Note' : 'Save Note'}
              </button>

              <div style={styles.timerContainer}>
                <h4>Pomodoro</h4>
                <div style={styles.timer}>{formatTime(timeLeft)}</div>
                <button style={styles.button} onClick={() => setTimerRunning(!timerRunning)}>
                  {timerRunning ? <><FiPause /> Pause</> : <><FiPlay /> Start</>}
                </button>
                <button style={{ ...styles.button, backgroundColor: '#4B5563' }} onClick={() => {
                  setTimeLeft(25 * 60); setTimerRunning(false);
                }}>
                  <FiRotateCcw /> Reset
                </button>
              </div>

              <h4>To-Do List</h4>
              <input
                style={styles.input}
                placeholder="New Task..."
                value={task}
                onChange={e => setTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              />
              {todo.map((item, index) => (
                <div key={item.id} style={styles.todoItem(item.done)} onClick={() => toggleTask(index)}>
                  <span><FiCheckCircle /> {item.task}</span>
                  <FiTrash2 style={{ cursor: 'pointer' }} onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(index);
                  }} />
                </div>
              ))}
            </div>

            <div style={styles.right}>
              <h4><FiCalendar /> Calendar</h4>
              <Calendar onChange={setDate} value={date} tileContent={tileContent} />
              <div style={styles.eventBox}>
                <h4>Add Calendar Note for {date.toDateString()}</h4>
                <textarea style={styles.textarea} value={eventNote} onChange={e => setEventNote(e.target.value)} />
                <button style={styles.button} onClick={handleEventSave}>Save Event Note</button>
              </div>
              {eventNote && (
                <div style={styles.eventBox}>
                  <h4><FiCheckCircle /> Event Note</h4>
                  <p>{eventNote}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyLearning;