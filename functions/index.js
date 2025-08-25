const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Função que espelha os dados de pets → pets_public
exports.publishPetPublic = functions.firestore
  .document("pets/{petId}")
  .onWrite(async (change, context) => {
    const petId = context.params.petId;
    const after = change.after.exists ? change.after.data() : null;

    if (!after) {
      // Se o pet for deletado, remove também a versão pública
      return admin.firestore().doc(`pets_public/${petId}`).delete();
    }

    // pega dados básicos do pet
    const pub = {
      name: after.name,
      species: after.species,
      breed: after.breed,
      notes: after.notes,
      photoUrl: after.photoUrl || null,
      lastLocation: after.lastLocation || null,
    };

    // Opcional: buscar dados do tutor
    if (after.userId) {
      const userSnap = await admin.firestore().doc(`users/${after.userId}`).get();
      if (userSnap.exists) {
        const u = userSnap.data();
        pub.tutorName = u.name || null;
        pub.tutorPhone = u.phone || null;
        pub.tutorEmail = u.email || null;
      }
    }

    // grava na coleção pública
    return admin.firestore().doc(`pets_public/${petId}`).set(pub, { merge: true });
  });
