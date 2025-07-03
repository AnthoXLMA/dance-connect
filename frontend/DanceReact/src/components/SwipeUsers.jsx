const [swipedUserIds, setSwipedUserIds] = useState([]);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token manquant !");
    return;
  }

    axios.get("/api/swipes/liked", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => setSwipedUserIds(res.data))
    .catch(console.error);
}, []);

const usersToSwipe = allUsers.filter(u => !swipedUserIds.includes(u.id));

{swipedUserIds.includes(user.id) ? (
  <button disabled>Déjà swipé</button>
) : (
  <button onClick={() => handleLike(user.id)}>Like</button>
)}


