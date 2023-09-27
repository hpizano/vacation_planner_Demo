import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

const VacationForm = ({ places, users, bookVacation })=> {
  const [placeId, setPlaceId] = useState('');
  const [userId, setUserId] = useState('');
  const [notes, setNotes] = useState('');
  
  const save = async(ev)=> {
    ev.preventDefault();
    const vacation = {
      user_id: userId,
      place_id: placeId,
      _notes: notes
    };

    console.log(vacation._notes)
    
    await bookVacation(vacation);
    setPlaceId('');
    setUserId('');
    setNotes('');
  }

  return (
    <form onSubmit={ save }>
      <select value={ userId } onChange={ ev => setUserId(ev.target.value)}>
        <option value=''>-- choose a user --</option>
        {
          users.map( user => {
            return (
              <option key={ user.id } value={ user.id }>{ user.name }</option>
            );
          })
        }
      </select>
      <select value={ placeId } onChange={ ev => setPlaceId(ev.target.value)}>
        <option value=''>-- choose a place --</option>
        {
          places.map( place => {
            return (
              <option key={ place.id } value={ place.id }>{ place.name }</option>
            );
          })
        }
      </select>
      
       <label htmlFor='note'> --- A note is required --- </label>
       <textarea value= { notes } onChange = {ev => setNotes(ev.target.value)}/>
       
      <button disabled={ !placeId || !userId || !notes } >Book Vacation</button>
    </form>
  );
}

const Users = ({ users, vacations })=> {
  return (
    <div>
      <h2>Users ({ users.length })</h2>
      <ul>
        {
          users.map( user => {
            return (
              <li key={ user.id }>
                { user.name }
                ({ vacations.filter(vacation => vacation.user_id === user.id).length })
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const Vacations = ({ vacations, places, users, cancelVacation })=> {
  return (
    <div>
      <h2>Vacations ({ vacations.length })</h2>
      <ul>
        {
          vacations.map( vacation => {
            const place = places.find(place => place.id === vacation.place_id);
            const user = users.find( user => user.id === vacation.user_id);
            const note = vacations.find( vacation => vacation._notes === vacation.note);
            return (
              <li key={ vacation.id }>
                { new Date(vacation.created_at).toLocaleString() }
                <div> 
                  { user ? user.name : ''} to { place ? place.name : '' }
                  <p>
                  { vacation ? vacation._notes:'' }
                  </p>
                </div>
                <button onClick={()=> cancelVacation(vacation)}>Cancel</button>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const Places = ({ places, vacations })=> {
  return (
    <div>
      <h2>Places ({ places.length })</h2>
      <ul>
        {
          places.map( place => {
            return (
              <li key={ place.id }>
                { place.name }
                ({ vacations.filter(vacation => vacation.place_id === place.id).length })
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

const App = ()=> {
  const [users, setUsers] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [places, setPlaces] = useState([]);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/vacations');
      setVacations(response.data);
    }
    fetchData();
  }, []);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/places');
      setPlaces(response.data);
    }
    fetchData();
  }, []);

  useEffect(()=> {
    const fetchData = async()=> {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    }
    fetchData();
  }, []);

  const bookVacation = async(vacation)=> {
    const response = await axios.post('/api/vacations', vacation);
    setVacations([...vacations, response.data]);
  }

  const cancelVacation = async(vacation)=> {
    await axios.delete(`/api/vacations/${vacation.id}`);
    setVacations(vacations.filter(_vacation => _vacation.id !== vacation.id));
  }

  return (
    <div>
      <h1>Vacation Planner</h1>
      <VacationForm places={ places } users={ users } bookVacation={ bookVacation }/>
      <main>
        <Vacations
          vacations={ vacations }
          users={ users }
          places={ places }
          cancelVacation={ cancelVacation }
        />
        <Users users={ users } vacations={ vacations }/>
        <Places places={ places } vacations={ vacations }/>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(<App />);
