// app/pet/dashboard.tsx
import { auth } from "@/services/firebase";
import { getLastRecordsForPet, getMyPets } from "@/services/pets";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import DropDownPicker from "react-native-dropdown-picker";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useTheme } from "../../../contexts/ThemeContext";

const screenWidth = Dimensions.get("window").width;

// Interfaces para Insights (mantidas iguais)
interface PetInsights {
  weightTrend: "increasing" | "decreasing" | "stable";
  weightChange: number;
  activityLevel: "low" | "normal" | "high";
  activityScore: number;
  healthStatus: "excellent" | "good" | "attention" | "concern";
  lastCheckup: number;
  nextEvent: { type: string; daysLeft: number; icon: string } | null;
}

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  trend?: "up" | "down" | "stable";
}

export default function PetDashboard() {
  const { colors, fontSizes } = useTheme();
  const { t } = useLanguage();
  
  const user = auth.currentUser;
  const uid = user?.uid;

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const [pesoData, setPesoData] = useState<any>(null);
  const [caminhadaData, setCaminhadaData] = useState<any>(null);
  const [notas, setNotas] = useState<any[]>([]);
  const [saudeNotas, setSaudeNotas] = useState<any[]>([]);

  // Estados para insights e estatísticas
  const [insights, setInsights] = useState<PetInsights | null>(null);
  const [statCards, setStatCards] = useState<StatCard[]>([]);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  // Modal para observação
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string>("");

  // Função para calcular insights automáticos (mantida igual)
  const calculateInsights = (records: any, petData: any): PetInsights => {
    const now = new Date();
    
    // Análise de peso
    const weights = records.WEIGHT || [];
    let weightTrend: "increasing" | "decreasing" | "stable" = "stable";
    let weightChange = 0;
    
    if (weights.length >= 2) {
      const recent = weights.slice(0, 2);
      const currentWeight = recent[0]?.value || 0;
      const previousWeight = recent[1]?.value || 0;
      weightChange = currentWeight - previousWeight;
      
      if (Math.abs(weightChange) > 0.5) {
        weightTrend = weightChange > 0 ? "increasing" : "decreasing";
      }
    }

    // Análise de atividade (caminhadas)
    const walks = records.WALK || [];
    const recentWalks = walks.filter((w: any) => {
      const walkDate = w.createdAt?.toDate?.() || new Date(w.createdAt);
      const diffDays = (now.getTime() - walkDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7; // última semana
    });
    
    const weeklyDistance = recentWalks.reduce((sum: number, w: any) => sum + (w.value || 0), 0);
    let activityLevel: "low" | "normal" | "high" = "normal";
    
    if (weeklyDistance < 10) activityLevel = "low";
    else if (weeklyDistance > 25) activityLevel = "high";

    // Análise de saúde
    const healthRecords = records.HEALTH || [];
    const lastVet = healthRecords.find((h: any) => h.value === "VISIT");
    const lastVetDate = lastVet?.createdAt?.toDate?.() || null;
    const daysSinceVet = lastVetDate 
      ? Math.floor((now.getTime() - lastVetDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let healthStatus: "excellent" | "good" | "attention" | "concern" = "good";
    if (daysSinceVet > 365) healthStatus = "concern";
    else if (daysSinceVet > 180) healthStatus = "attention";
    else if (daysSinceVet < 30) healthStatus = "excellent";

    // Próximo evento
    let nextEvent = null;
    if (daysSinceVet > 300) {
      nextEvent = { type: "Consulta veterinária", daysLeft: 365 - daysSinceVet, icon: "medical" };
    }

    return {
      weightTrend,
      weightChange,
      activityLevel,
      activityScore: weeklyDistance,
      healthStatus,
      lastCheckup: daysSinceVet,
      nextEvent
    };
  };

  // Função para gerar cards de estatísticas (adaptada para traduções)
  const generateStatCards = (records: any, insights: PetInsights): StatCard[] => {
    const weights = records.WEIGHT || [];
    const walks = records.WALK || [];
    const currentWeight = weights[0]?.value || 0;
    
    const cards: StatCard[] = [
      {
        title: "Peso Atual",
        value: currentWeight ? `${currentWeight} kg` : "—",
        subtitle: insights.weightChange !== 0 
          ? `${insights.weightChange > 0 ? '+' : ''}${insights.weightChange.toFixed(1)}kg`
          : "Estável",
        icon: "fitness",
        color: insights.weightTrend === "increasing" ? "#F59E0B" : 
               insights.weightTrend === "decreasing" ? "#EF4444" : "#22C55E",
        trend: insights.weightTrend === "stable" ? "stable" :
               insights.weightTrend === "increasing" ? "up" : "down"
      },
      {
        title: "Atividade Semanal",
        value: `${insights.activityScore.toFixed(1)} km`,
        subtitle: insights.activityLevel === "high" ? "Muito ativo!" : 
                  insights.activityLevel === "low" ? "Precisa se exercitar" : "Nível bom",
        icon: "walk",
        color: insights.activityLevel === "high" ? "#22C55E" :
               insights.activityLevel === "low" ? "#EF4444" : "#3B82F6",
        trend: insights.activityLevel === "high" ? "up" : 
               insights.activityLevel === "low" ? "down" : "stable"
      },
      {
        title: "Status de Saúde",
        value: insights.healthStatus === "excellent" ? "Excelente" :
               insights.healthStatus === "good" ? "Bom" :
               insights.healthStatus === "attention" ? "Atenção" : "Preocupante",
        subtitle: insights.lastCheckup < 999 ? `${insights.lastCheckup} dias desde consulta` : "Sem consulta registrada",
        icon: "heart",
        color: insights.healthStatus === "excellent" ? "#22C55E" :
               insights.healthStatus === "good" ? "#3B82F6" :
               insights.healthStatus === "attention" ? "#F59E0B" : "#EF4444"
      },
      {
        title: "Total de Registros",
        value: `${(records.WALK?.length || 0) + (records.WEIGHT?.length || 0) + (records.HEALTH?.length || 0)}`,
        subtitle: "Atividades registradas",
        icon: "analytics",
        color: "#8B5CF6"
      }
    ];

    return cards;
  };

  // carrega pets do usuário (mantida igual)
  useEffect(() => {
    if (!uid) return;

    const loadPets = async () => {
      const myPets = await getMyPets(uid);
      setPets(myPets);
      setItems(myPets.map(p => ({ label: p.name, value: p.id })));
      if (myPets.length > 0) setSelectedPetId(myPets[0].id);
    };

    loadPets();
  }, [uid]);

  // carrega records do pet selecionado e calcula insights (mantida igual)
  useEffect(() => {
    if (!selectedPetId) return;

    const loadRecords = async () => {
      const pet = pets.find(p => p.id === selectedPetId);
      if (!pet) return;

      const records = await getLastRecordsForPet(selectedPetId, 50);

      // Dados para gráficos (mantido igual)
      const pesoArr = records.WEIGHT?.map(r => ({ ...r, petName: pet.name })) || [];
      setPesoData({
        labels: pesoArr.map(d => new Date(d.createdAt.toDate()).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })),
        datasets: [{ data: pesoArr.map(d => d.value) }],
      });

      const caminhadaArr = records.WALK?.map(r => ({ ...r, petName: pet.name })) || [];
      setCaminhadaData({
        labels: caminhadaArr.map(d => new Date(d.createdAt.toDate()).toLocaleDateString("pt-BR", { weekday: "short" })),
        datasets: [{ data: caminhadaArr.map(d => d.value) }],
      });

      setNotas(records.NOTE?.map(r => ({ ...r, petName: pet.name })) || []);
      setSaudeNotas(records.HEALTH?.map(r => ({ ...r, petName: pet.name })) || []);

      // Calcular insights e estatísticas
      const petInsights = calculateInsights(records, pet);
      setInsights(petInsights);
      setStatCards(generateStatCards(records, petInsights));
    };

    loadRecords();
  }, [selectedPetId, pets]);

  // Configuração do gráfico adaptada ao tema
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.background,
    decimalPlaces: 1,
    color: (opacity = 1) => `${colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    labelColor: (opacity = 1) => `${colors.text}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    style: { borderRadius: 16 },
    propsForDots: { r: "5", strokeWidth: "2", stroke: colors.primary },
  };

  // Componente do Card de Estatística
  const StatCardComponent = ({ stat }: { stat: StatCard }) => (
    <View style={[
      styles.statCard, 
      { 
        borderLeftColor: stat.color,
        backgroundColor: colors.surface,
      }
    ]}>
      <View style={styles.statHeader}>
        <Ionicons name={stat.icon as any} size={24} color={stat.color} />
        {stat.trend && (
          <Ionicons 
            name={stat.trend === "up" ? "trending-up" : stat.trend === "down" ? "trending-down" : "remove"} 
            size={16} 
            color={stat.trend === "up" ? "#22C55E" : stat.trend === "down" ? "#EF4444" : "#6B7280"} 
          />
        )}
      </View>
      <Text style={[styles.statTitle, { 
        color: colors.textSecondary,
        fontSize: fontSizes.sm
      }]}>
        {stat.title}
      </Text>
      <Text style={[styles.statValue, { 
        color: stat.color,
        fontSize: fontSizes.xl
      }]}>
        {stat.value}
      </Text>
      <Text style={[styles.statSubtitle, { 
        color: colors.textTertiary,
        fontSize: fontSizes.xs
      }]}>
        {stat.subtitle}
      </Text>
    </View>
  );

  // Componente de Insights
  const InsightsCard = ({ insights }: { insights: PetInsights }) => (
    <View style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
      <View style={styles.insightsHeader}>
        <Ionicons name="bulb" size={24} color="#F59E0B" />
        <Text style={[styles.insightsTitle, { 
          color: colors.text,
          fontSize: fontSizes.lg
        }]}>
          Insights Automáticos
        </Text>
      </View>
      
      {insights.nextEvent && (
        <View style={styles.insightItem}>
          <Ionicons name={insights.nextEvent.icon as any} size={20} color="#EF4444" />
          <Text style={[styles.insightText, { 
            color: colors.textSecondary,
            fontSize: fontSizes.sm
          }]}>
            {insights.nextEvent.type} recomendada em {Math.abs(insights.nextEvent.daysLeft)} dias
          </Text>
        </View>
      )}
      
      {insights.weightTrend !== "stable" && (
        <View style={styles.insightItem}>
          <Ionicons name="fitness" size={20} color={insights.weightTrend === "increasing" ? "#F59E0B" : "#EF4444"} />
          <Text style={[styles.insightText, { 
            color: colors.textSecondary,
            fontSize: fontSizes.sm
          }]}>
            Peso {insights.weightTrend === "increasing" ? "aumentou" : "diminuiu"} {Math.abs(insights.weightChange).toFixed(1)}kg recentemente
          </Text>
        </View>
      )}
      
      {insights.activityLevel === "low" && (
        <View style={styles.insightItem}>
          <Ionicons name="walk" size={20} color="#EF4444" />
          <Text style={[styles.insightText, { 
            color: colors.textSecondary,
            fontSize: fontSizes.sm
          }]}>
            Atividade baixa esta semana. Que tal um passeio extra?
          </Text>
        </View>
      )}
      
      {insights.activityLevel === "high" && (
        <View style={styles.insightItem}>
          <Ionicons name="trophy" size={20} color="#22C55E" />
          <Text style={[styles.insightText, { 
            color: colors.textSecondary,
            fontSize: fontSizes.sm
          }]}>
            Excelente! Seu pet está muito ativo esta semana!
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { 
          color: colors.primary,
          fontSize: fontSizes.xxl
        }]}>
          Saúde do Pet
        </Text>
        <Ionicons name="analytics" size={28} color={colors.primary} />
      </View>

      {/* Dropdown fora do ScrollView */}
      <View style={styles.dropdownContainer}>
        <Text style={[styles.sectionLabel, { 
          color: colors.text,
          fontSize: fontSizes.md
        }]}>
          Selecione o pet
        </Text>
        <DropDownPicker
          open={open}
          value={selectedPetId}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedPetId}
          setItems={setItems}
          style={[styles.dropdown, { 
            borderColor: colors.primary,
            backgroundColor: colors.surface
          }]}
          textStyle={[styles.dropdownText, { 
            color: colors.text,
            fontSize: fontSizes.md
          }]}
          dropDownContainerStyle={[styles.dropdownList, { 
            borderColor: colors.primary,
            backgroundColor: colors.surface
          }]}
          placeholder="Selecione um pet"
          placeholderStyle={{ color: colors.textSecondary }}
          zIndex={1000}
          zIndexInverse={3000}
        />
      </View>

      {/* ScrollView sem FlatList aninhada */}
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cards de Estatísticas */}
        {statCards.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { 
              color: colors.text,
              fontSize: fontSizes.lg
            }]}>
              Resumo
            </Text>
            <View style={styles.statsGrid}>
              {statCards.map((stat, index) => (
                <StatCardComponent key={index} stat={stat} />
              ))}
            </View>
          </View>
        )}

        {/* Insights Automáticos */}
        {insights && (
          <View style={styles.section}>
            <InsightsCard insights={insights} />
          </View>
        )}

        {/* Gráfico de Peso */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: colors.text,
            fontSize: fontSizes.lg
          }]}>
            Evolução do Peso
          </Text>
          {pesoData?.datasets[0].data.length > 0 ? (
            <LineChart
              data={pesoData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={[styles.noDataContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="fitness-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.noDataText, { 
                color: colors.textSecondary,
                fontSize: fontSizes.md
              }]}>
                Sem registros de peso ainda
              </Text>
              <Text style={[styles.noDataSubtitle, { 
                color: colors.textTertiary,
                fontSize: fontSizes.sm
              }]}>
                Registre o peso do seu pet para ver a evolução
              </Text>
            </View>
          )}
        </View>

        {/* Gráfico de Caminhadas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: colors.text,
            fontSize: fontSizes.lg
          }]}>
            Atividade Física
          </Text>
          {caminhadaData?.datasets[0].data.length > 0 ? (
            <BarChart
              data={caminhadaData}
              width={screenWidth - 32}
              height={220}
              yAxisSuffix=" km"
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
            />
          ) : (
            <View style={[styles.noDataContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="walk-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.noDataText, { 
                color: colors.textSecondary,
                fontSize: fontSizes.md
              }]}>
                Sem registros de caminhadas ainda
              </Text>
              <Text style={[styles.noDataSubtitle, { 
                color: colors.textTertiary,
                fontSize: fontSizes.sm
              }]}>
                Registre as caminhadas para acompanhar a atividade
              </Text>
            </View>
          )}
        </View>

        {/* Notas Gerais usando map() em vez de FlatList */}
        {notas.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: colors.text,
              fontSize: fontSizes.lg
            }]}>
              Últimas Anotações
            </Text>
            {notas.slice(0, 3).map((item) => (
              <View key={item.id} style={[
                styles.noteCard, 
                { 
                  backgroundColor: colors.surface,
                  borderLeftColor: colors.info || "#3B82F6"
                }
              ]}>
                <View style={styles.noteHeader}>
                  <Text style={[styles.notePetName, { 
                    color: colors.primary,
                    fontSize: fontSizes.sm
                  }]}>
                    {item.petName}
                  </Text>
                  <Text style={[styles.noteDate, { 
                    color: colors.textSecondary,
                    fontSize: fontSizes.xs
                  }]}>
                    {new Date(item.createdAt.toDate()).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                <Text style={[styles.noteText, { 
                  color: colors.text,
                  fontSize: fontSizes.sm
                }]} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notas de Saúde usando map() em vez de FlatList */}
        {saudeNotas.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: colors.text,
              fontSize: fontSizes.lg
            }]}>
              Últimos Eventos de Saúde
            </Text>
            {saudeNotas.slice(0, 3).map((item) => (
              <View key={item.id} style={[
                styles.healthCard, 
                { 
                  backgroundColor: colors.surface,
                  borderLeftColor: colors.error || "#EF4444"
                }
              ]}>
                <View style={styles.healthHeader}>
                  <View style={[styles.healthIconContainer, { 
                    backgroundColor: colors.error ? `${colors.error}20` : "#FEE2E2"
                  }]}>
                    <Ionicons 
                      name={item.value === "VACCINE" ? "medical" : 
                            item.value === "VISIT" ? "heart" :
                            item.value === "BATH" ? "water" : "fitness"} 
                      size={20} 
                      color={colors.error || "#EF4444"} 
                    />
                  </View>
                  <View style={styles.healthInfo}>
                    <Text style={[styles.healthType, { 
                      color: colors.text,
                      fontSize: fontSizes.sm
                    }]}>
                      {item.value === "VACCINE" ? "Vacina" : 
                       item.value === "DEWORM" ? "Vermífugo" : 
                       item.value === "BATH" ? "Banho" : "Consulta"}
                    </Text>
                    <Text style={[styles.healthDate, { 
                      color: colors.textSecondary,
                      fontSize: fontSizes.xs
                    }]}>
                      {new Date(item.createdAt.toDate()).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>
                
                {item.note && (
                  <TouchableOpacity
                    style={styles.viewNoteButton}
                    onPress={() => { setSelectedNote(item.note); setModalVisible(true); }}
                  >
                    <Text style={[styles.viewNoteText, { 
                      color: colors.primary,
                      fontSize: fontSizes.xs
                    }]}>
                      Ver observação
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Espaçamento final */}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal de observação */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { 
              color: colors.text,
              fontSize: fontSizes.md
            }]}>
              Observação:
            </Text>
            <Text style={[styles.modalText, { 
              color: colors.textSecondary,
              fontSize: fontSizes.sm
            }]}>
              {selectedNote}
            </Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.modalButtonText, { fontSize: fontSizes.sm }]}>
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos atualizados
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontWeight: "800",
  },
  
  // Container específico para dropdown
  dropdownContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    zIndex: 1000,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    borderRadius: 12,
  },
  dropdownText: {
    fontWeight: "600",
  },
  dropdownList: {
    borderRadius: 12,
  },
  
  // Containers para ScrollView
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 16,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statTitle: {
    fontWeight: "500",
  },
  statValue: {
    fontWeight: "800",
    marginVertical: 4,
  },
  statSubtitle: {
    // Dynamic styles applied inline
  },
  insightsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightsTitle: {
    fontWeight: "700",
    marginLeft: 8,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  chart: {
    borderRadius: 12,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    borderRadius: 12,
  },
  noDataText: {
    fontWeight: "600",
    marginTop: 12,
  },
  noDataSubtitle: {
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 32,
  },
  
  // Estilos para as notas (sem FlatList)
  noteCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  notePetName: {
    fontWeight: "700",
  },
  noteDate: {
    // Dynamic styles applied inline
  },
  noteText: {
    lineHeight: 18,
  },
  healthCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthInfo: {
    flex: 1,
  },
  healthType: {
    fontWeight: "700",
  },
  healthDate: {
    marginTop: 2,
  },
  viewNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    padding: 6,
  },
  viewNoteText: {
    fontWeight: "600",
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    alignSelf: "flex-end",
    padding: 8,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
