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

interface Pet {
  id: string;
  nome: string;
}

interface Lembrete {
  id?: string;
  petId: string;
  titulo: string;
  descricao?: string;
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
}

const categorias = [
  { label: 'Consulta', value: 'consulta' },
  { label: 'Medicação', value: 'medicacao' },
  { label: 'Banho', value: 'banho' },
  { label: 'Outro', value: 'outro' },
];

export function ModalLembrete({ visible, onClose, onSave, pets, lembreteEditar }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<'consulta' | 'medicacao' | 'banho' | 'outro'>('consulta');
  const [petId, setPetId] = useState('');
  const [dataHora, setDataHora] = useState(new Date());
  const [concluido, setConcluido] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (lembreteEditar) {
      setTitulo(lembreteEditar.titulo);
      setDescricao(lembreteEditar.descricao || '');
      setCategoria(lembreteEditar.categoria);
      setPetId(lembreteEditar.petId);
      setDataHora(lembreteEditar.dataHora);
      setConcluido(lembreteEditar.concluido);
    } else {
      // Resetar campos para novo lembrete
      setTitulo('');
      setDescricao('');
      setCategoria('consulta');
      setPetId(pets.length > 0 ? pets[0].id : '');
      setDataHora(new Date());
      setConcluido(false);
    }
  }, [lembreteEditar, pets, visible]);

  function handleSalvar() {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return;
    }
    if (!petId) {
      Alert.alert('Erro', 'Selecione um pet');
      return;
    }

    onSave({
      id: lembreteEditar?.id,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      petId,
      dataHora,
      concluido,
    });
    onClose();
  }

  function onChangeDate(event: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(dataHora);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDataHora(newDate);
    }
  }

  function onChangeTime(event: any, selectedTime?: Date) {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(dataHora);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDataHora(newDate);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}> {lembreteEditar ? 'Editar Lembrete' : 'Novo Lembrete'} </Text>

          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Digite o título"
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição opcional"
            multiline={true}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.opcoes}>
            {categorias.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.opcao, categoria === cat.value && styles.opcaoSelecionada]}
                onPress={() => setCategoria(cat.value as any)}
              >
                <Text style={categoria === cat.value ? styles.textoSelecionado : styles.textoOpcao}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Pet</Text>
          <View style={styles.opcoes}>
            {pets.map(pet => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.opcao, petId === pet.id && styles.opcaoSelecionada]}
                onPress={() => setPetId(pet.id)}
              >
                <Text style={petId === pet.id ? styles.textoSelecionado : styles.textoOpcao}>
                  {pet.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Data</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{dataHora.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dataHora}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
            />
          )}

          <Text style={styles.label}>Hora</Text>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
            <Text>{dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={dataHora}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeTime}
            />
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, concluido && styles.checkboxChecked]}
              onPress={() => setConcluido(!concluido)}
            >
              {concluido && <Text style={styles.checkboxMark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Concluído</Text>
          </View>

          <View style={styles.botoes}>
            <TouchableOpacity onPress={onClose} style={[styles.botao, styles.botaoCancelar]}>
              <Text style={styles.textoBotao}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSalvar} style={[styles.botao, styles.botaoSalvar]}>
              <Text style={[styles.textoBotao, { color: '#fff' }]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  opcao: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoSelecionada: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  textoOpcao: {
    color: '#333',
  },
  textoSelecionado: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkboxMark: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#ccc',
  },
  botaoSalvar: {
    backgroundColor: '#007bff',
  },
  textoBotao: {
    fontWeight: '600',
    fontSize: 16,
  },
});
