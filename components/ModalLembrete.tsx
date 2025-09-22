// components/ModalLembrete.tsx

import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface Pet {
  id: string;
  nome: string;
  cor: string;
}

interface Lembrete {
  id?: string;
  titulo: string;
  descricao?: string;
  petId: string;
  categoria: 'consulta' | 'medicacao' | 'banho' | 'outro';
  dataHora: Date;
  concluido: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (lembrete: Lembrete) => void;
  pets: Pet[];
  lembreteEditar?: Lembrete | null;
  dataSelecionada?: string; // ✅ ADICIONADO: Recebe a data selecionada no calendário
}

export function ModalLembrete({
  visible,
  onClose,
  onSave,
  pets,
  lembreteEditar,
  dataSelecionada, // ✅ ADICIONADO
}: Props) {
  const { colors, fontSizes, isDark } = useTheme();
  const { t } = useLanguage();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [petSelecionado, setPetSelecionado] = useState('');
  const [categoria, setCategoria] = useState<'consulta' | 'medicacao' | 'banho' | 'outro'>('consulta');
  const [dataHora, setDataHora] = useState(new Date());
  const [concluido, setConcluido] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [showCategoriaPicker, setShowCategoriaPicker] = useState(false);

  // Estados temporários para os pickers iOS
  const [tempDate, setTempDate] = useState(new Date());

  const categorias = [
    { key: 'consulta', label: t('category.consulta') },
    { key: 'medicacao', label: t('category.medicacao') },
    { key: 'banho', label: t('category.banho') },
    { key: 'outro', label: t('category.outro') },
  ];

  useEffect(() => {
    if (lembreteEditar) {
      // ✅ Editando lembrete existente
      setTitulo(lembreteEditar.titulo);
      setDescricao(lembreteEditar.descricao || '');
      setPetSelecionado(lembreteEditar.petId);
      setCategoria(lembreteEditar.categoria);
      setDataHora(lembreteEditar.dataHora);
      setConcluido(lembreteEditar.concluido);
    } else {
      // ✅ CORRIGIDO: Novo lembrete - usar data selecionada no calendário
      setTitulo('');
      setDescricao('');
      setPetSelecionado('');
      setCategoria('consulta');
      setConcluido(false);
      
      // ✅ NOVO: Se tem data selecionada, usar ela como base
      if (dataSelecionada) {
        const dataBase = new Date(dataSelecionada + 'T09:00:00'); // Padrão 9h da manhã
        setDataHora(dataBase);
      } else {
        // Caso não tenha data selecionada, usar data atual
        const agora = new Date();
        agora.setHours(9, 0, 0, 0); // Padrão 9h da manhã
        setDataHora(agora);
      }
    }
  }, [lembreteEditar, visible, dataSelecionada]); // ✅ ADICIONADO dataSelecionada na dependência

  function handleSave() {
    if (!titulo.trim()) {
      Alert.alert(t('general.error'), 'Título é obrigatório');
      return;
    }

    if (!petSelecionado) {
      Alert.alert(t('general.error'), 'Selecione um pet');
      return;
    }

    const lembrete: Lembrete = {
      id: lembreteEditar?.id,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      petId: petSelecionado,
      categoria,
      dataHora,
      concluido,
    };

    onSave(lembrete);
    onClose();
  }

  function onDateChange(event: any, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        const newDate = new Date(dataHora);
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());
        setDataHora(newDate);
      }
    } else {
      // iOS - apenas atualiza o estado temporário
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  }

  function onTimeChange(event: any, selectedTime?: Date) {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedTime) {
        const newDate = new Date(dataHora);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());
        setDataHora(newDate);
      }
    } else {
      // iOS - apenas atualiza o estado temporário
      if (selectedTime) {
        setTempDate(selectedTime);
      }
    }
  }

  function handleDatePickerOpen() {
    setTempDate(dataHora);
    setShowDatePicker(true);
  }

  function handleTimePickerOpen() {
    setTempDate(dataHora);
    setShowTimePicker(true);
  }

  function confirmDatePicker() {
    const newDate = new Date(dataHora);
    newDate.setFullYear(tempDate.getFullYear());
    newDate.setMonth(tempDate.getMonth());
    newDate.setDate(tempDate.getDate());
    setDataHora(newDate);
    setShowDatePicker(false);
  }

  function confirmTimePicker() {
    const newDate = new Date(dataHora);
    newDate.setHours(tempDate.getHours());
    newDate.setMinutes(tempDate.getMinutes());
    setDataHora(newDate);
    setShowTimePicker(false);
  }

  const petSelecionadoNome = pets.find(p => p.id === petSelecionado)?.nome || t('agenda.selectPet');
  const categoriaSelecionadaLabel = categorias.find(c => c.key === categoria)?.label || categoria;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.titulo, { color: colors.text, fontSize: fontSizes.xl }]}>
              {lembreteEditar ? t('agenda.editReminder') : t('agenda.newReminder')}
            </Text>

            <View style={styles.campo}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.md }]}>
                {t('agenda.reminderTitle')} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                    fontSize: fontSizes.md,
                  },
                ]}
                value={titulo}
                onChangeText={setTitulo}
                placeholder={t('agenda.reminderTitle')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.campo}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.md }]}>
                {t('agenda.reminderDescription')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                    fontSize: fontSizes.md,
                  },
                ]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder={t('agenda.reminderDescription')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.campo}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.md }]}>
                Pet *
              </Text>
              <TouchableOpacity
                style={[
                  styles.picker,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowPetPicker(!showPetPicker)}
              >
                <Text style={[styles.pickerText, { color: colors.text, fontSize: fontSizes.md }]}>
                  {petSelecionadoNome}
                </Text>
                <Text style={[styles.pickerArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
              
              {showPetPicker && (
                <View style={[styles.pickerOptions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {pets.map(pet => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[styles.option, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setPetSelecionado(pet.id);
                        setShowPetPicker(false);
                      }}
                    >
                      <Text style={[styles.optionText, { color: colors.text, fontSize: fontSizes.md }]}>
                        {pet.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.campo}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.md }]}>
                {t('agenda.selectCategory')} *
              </Text>
              <TouchableOpacity
                style={[
                  styles.picker,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowCategoriaPicker(!showCategoriaPicker)}
              >
                <Text style={[styles.pickerText, { color: colors.text, fontSize: fontSizes.md }]}>
                  {categoriaSelecionadaLabel}
                </Text>
                <Text style={[styles.pickerArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
              
              {showCategoriaPicker && (
                <View style={[styles.pickerOptions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {categorias.map(cat => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[styles.option, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setCategoria(cat.key as any);
                        setShowCategoriaPicker(false);
                      }}
                    >
                      <Text style={[styles.optionText, { color: colors.text, fontSize: fontSizes.md }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.dateTimeContainer}>
              <View style={[styles.campo, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.md }]}>
                  {t('agenda.selectDate')} *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.picker,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleDatePickerOpen}
                >
                  <Text style={[styles.pickerText, { color: colors.text, fontSize: fontSizes.md }]}>
                    {dataHora.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.campo, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.md }]}>
                  {t('agenda.selectTime')} *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.picker,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleTimePickerOpen}
                >
                  <Text style={[styles.pickerText, { color: colors.text, fontSize: fontSizes.md }]}>
                    {dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {lembreteEditar && (
              <View style={styles.campo}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setConcluido(!concluido)}
                >
                  <View style={[styles.checkbox, { borderColor: colors.border }]}>
                    {concluido && (
                      <View style={[styles.checkboxInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { color: colors.text, fontSize: fontSizes.md }]}>
                    {t('agenda.completed')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.botoes}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.botao, styles.botaoCancelar, { backgroundColor: colors.border }]}
              >
                <Text style={[styles.textoBotao, { color: colors.text, fontSize: fontSizes.md }]}>
                  {t('general.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.botao, styles.botaoSalvar, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.textoBotao, { color: '#fff', fontSize: fontSizes.md }]}>
                  {t('general.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* DateTimePicker para Data */}
          {showDatePicker && (
            <View style={styles.pickerOverlay}>
              <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.pickerButton, { color: colors.textSecondary }]}>
                      {t('general.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>
                    {t('agenda.selectDate')}
                  </Text>
                  <TouchableOpacity onPress={confirmDatePicker}>
                    <Text style={[styles.pickerButton, { color: colors.primary }]}>
                      {t('button.ok')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  themeVariant={isDark ? 'dark' : 'light'}
                  textColor={colors.text}
                />
              </View>
            </View>
          )}

          {/* DateTimePicker para Hora */}
          {showTimePicker && (
            <View style={styles.pickerOverlay}>
              <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={[styles.pickerButton, { color: colors.textSecondary }]}>
                      {t('general.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>
                    {t('agenda.selectTime')}
                  </Text>
                  <TouchableOpacity onPress={confirmTimePicker}>
                    <Text style={[styles.pickerButton, { color: colors.primary }]}>
                      {t('button.ok')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                  themeVariant={isDark ? 'dark' : 'light'}
                  textColor={colors.text}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 12,
    maxHeight: '90%',
    padding: 20,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  campo: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    flex: 1,
    textAlign: 'left',
  },
  pickerArrow: {
    fontSize: 12,
  },
  pickerOptions: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  optionText: {
    textAlign: 'left',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checkboxLabel: {
    flex: 1,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelar: {
    // backgroundColor definido dinamicamente
  },
  botaoSalvar: {
    // backgroundColor definido dinamicamente
  },
  textoBotao: {
    fontWeight: '600',
  },
  // Estilos para os pickers de data/hora
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    borderRadius: 12,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pickerButton: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});
