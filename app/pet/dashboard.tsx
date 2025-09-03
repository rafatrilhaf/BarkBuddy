// app/pet/dashboard.tsx
import { auth } from "@/services/firebase";
import { getLastRecordsForPet, getMyPets } from "@/services/pets";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import DropDownPicker from "react-native-dropdown-picker";

const screenWidth = Dimensions.get("window").width;

export default function PetDashboard() {
  const user = auth.currentUser;
  const uid = user?.uid;

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const [pesoData, setPesoData] = useState<any>(null);
  const [caminhadaData, setCaminhadaData] = useState<any>(null);
  const [notas, setNotas] = useState<any[]>([]);
  const [saudeNotas, setSaudeNotas] = useState<any[]>([]);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  // carrega pets do usuário
  useEffect(() => {
    if (!uid) return;

    const loadPets = async () => {
      const myPets = await getMyPets(uid);
      setPets(myPets);
      setItems(myPets.map(p => ({ label: p.name, value: p.id })));
      if (myPets.length > 0) setSelectedPetId(myPets[0].id); // seleciona o primeiro
    };

    loadPets();
  }, [uid]);

  // carrega records do pet selecionado
  useEffect(() => {
    if (!selectedPetId) return;

    const loadRecords = async () => {
      const pet = pets.find(p => p.id === selectedPetId);
      if (!pet) return;

      const records = await getLastRecordsForPet(selectedPetId, 50);

      // Peso
      const pesoArr = records.WEIGHT ? [{ ...records.WEIGHT, petName: pet.name }] : [];
      setPesoData({
        labels: pesoArr.map(d => new Date(d.createdAt.toDate()).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })),
        datasets: [{ data: pesoArr.map(d => d.value) }],
      });

      // Caminhada
      const caminhadaArr = records.WALK ? [{ ...records.WALK, petName: pet.name }] : [];
      setCaminhadaData({
        labels: caminhadaArr.map(d => new Date(d.createdAt.toDate()).toLocaleDateString("pt-BR", { weekday: "short" })),
        datasets: [{ data: caminhadaArr.map(d => d.value) }],
      });

      // Notas gerais
      const notasArr = records.NOTE ? [{ ...records.NOTE, petName: pet.name }] : [];
      setNotas(notasArr);

      // Notas de saúde
      const saudeArr = records.HEALTH ? [{ ...records.HEALTH, petName: pet.name }] : [];
      setSaudeNotas(saudeArr);
    };

    loadRecords();
  }, [selectedPetId, pets]);

  const chartConfig = {
    backgroundColor: "#e8f5ee",
    backgroundGradientFrom: "#e8f5ee",
    backgroundGradientTo: "#c1e3d2",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 107, 65, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "5", strokeWidth: "2", stroke: "#006B41" },
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: "#006B41", marginBottom: 12 }}>
        Dashboard do Pet
      </Text>

      {/* Picker de pets */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 6 }}>Selecione o pet</Text>
      <DropDownPicker
        open={open}
        value={selectedPetId}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedPetId}
        setItems={setItems}
        style={{ borderColor: "#006B41" }}
        textStyle={{ color: "#006B41", fontWeight: "600" }}
        dropDownContainerStyle={{ borderColor: "#006B41" }}
        placeholder="Selecione um pet"
      />

      {/* Conteúdo rolável */}
      <FlatList
        style={{ marginTop: 16 }}
        data={[{ key: 'charts' }]} // só para usar FlatList e evitar ScrollView
        renderItem={() => (
          <>
            {/* Peso */}
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 6, marginTop: 16 }}>Peso (kg)</Text>
            {pesoData && pesoData.datasets[0].data.length > 0 ? (
              <LineChart
                data={pesoData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 16, marginBottom: 24 }}
              />
            ) : (
              <Text style={{ opacity: 0.6, marginBottom: 24 }}>Sem registros de peso ainda.</Text>
            )}

            {/* Caminhadas */}
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 6 }}>Caminhadas (km)</Text>
            {caminhadaData && caminhadaData.datasets[0].data.length > 0 ? (
              <BarChart
                data={caminhadaData}
                width={screenWidth - 32}
                height={220}
                yAxisSuffix=" km"
                chartConfig={chartConfig}
                style={{ borderRadius: 16, marginBottom: 24 }}
                yAxisLabel={""}
              />
            ) : (
              <Text style={{ opacity: 0.6, marginBottom: 24 }}>Sem registros de caminhadas ainda.</Text>
            )}

            {/* Notas */}
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 6 }}>Últimas anotações</Text>
            {notas.length > 0 ? (
              <FlatList
                data={notas}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={{ backgroundColor: "#f7f7f7", padding: 10, borderRadius: 10, marginBottom: 8 }}>
                    <Text style={{ fontWeight: "700", color: "#006B41" }}>{item.petName}</Text>
                    <Text style={{ marginTop: 2 }}>{item.value}</Text>
                    <Text style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                      {new Date(item.createdAt.toDate()).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <Text style={{ opacity: 0.6 }}>Nenhuma anotação registrada.</Text>
            )}

            {/* Notas de saúde */}
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 6, marginTop: 16 }}>Notas de Saúde</Text>
            {saudeNotas.length > 0 ? (
              <FlatList
                data={saudeNotas}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={{ backgroundColor: "#fff0f0", padding: 10, borderRadius: 10, marginBottom: 8 }}>
                    <Text style={{ fontWeight: "700", color: "#c00" }}>{item.petName}</Text>
                    <Text style={{ marginTop: 2 }}>{item.value}</Text>
                    <Text style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                      {new Date(item.createdAt.toDate()).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <Text style={{ opacity: 0.6 }}>Nenhuma nota de saúde registrada.</Text>
            )}
          </>
        )}
      />
    </View>
  );
}
