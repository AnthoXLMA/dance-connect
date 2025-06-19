const [swipedUserIds, setSwipedUserIds] = useState([]);

useEffect(() => {
  axios.get("/api/swipes/ids") // GET API avec les swipedId
    .then(res => setSwipedUserIds(res.data))
    .catch(console.error);
}, []);

const usersToSwipe = allUsers.filter(u => !swipedUserIds.includes(u.id));

{swipedUserIds.includes(user.id) ? (
  <button disabled>Déjà swipé</button>
) : (
  <button onClick={() => handleLike(user.id)}>Like</button>
)}
