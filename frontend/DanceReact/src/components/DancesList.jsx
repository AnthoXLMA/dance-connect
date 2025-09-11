import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DancesList() {
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:4000/api/dances')
      .then(response => {
        setDances(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors du chargement des danses.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Liste des Danses</h2>
      <ul>
        {dances.map(dance => (
          <li key={dance.id}>{dance.name}</li>
        ))}
      </ul>
    </div>
  );
}
