import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from "@expo/vector-icons/build/Ionicons";
type Props = {
  label: string;
  theme?: string;
  onPress?: () => void;
};

export default function Button({ label, theme, onPress }: Props) {
  if (theme === 'edit') {
    return (
      <View style={[styles.buttonContainer]}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonMain,
            styles.modernButton,
            {
              backgroundColor: pressed ? '#2980b9' : '#3498db',
              shadowOpacity: pressed ? 0.1 : 0.3
            }
          ]}
          onPress={onPress}
        >
          <Ionicons size={20} name='create-outline' color="#fff"></Ionicons>
          <Text style={[styles.buttonLabel, styles.modernButtonText]}>{label}</Text>
        </Pressable>
      </View>
    );
  } else if (theme === 'delete') {
    return (
      <View style={[styles.buttonContainer]}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonMain,
            styles.modernButton,
            {
              backgroundColor: pressed ? '#c0392b' : '#e74c3c',
              shadowOpacity: pressed ? 0.1 : 0.3
            }
          ]}
          onPress={onPress}
        >
          <Ionicons size={20} name='trash-outline' color="#fff"></Ionicons>
          <Text style={[styles.buttonLabel, styles.modernButtonText]}>{label}</Text>
        </Pressable>
      </View>
    );
  }
  else if (theme === 'add') {
    return (
      <View style={[styles.buttonContainer]}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonMain,
            styles.modernButton,
            {
              backgroundColor: pressed ? '#2980b9' : '#3498db',
              shadowOpacity: pressed ? 0.1 : 0.3
            }
          ]}
          onPress={onPress}
        >
          <Ionicons size={20} name='add-outline' color="#fff"></Ionicons>
          <Text style={[styles.buttonLabel, styles.modernButtonText]}>{label}</Text>
        </Pressable>
      </View>
    );
  }
  else if (theme === 'close') {
    return (
      <View style={[styles.buttonContainer]}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonMain,
            styles.modernButton,
            {
              backgroundColor: pressed ? '#c0392b' : '#e74c3c',
              shadowOpacity: pressed ? 0.1 : 0.3
            }
          ]}
          onPress={onPress}
        >
          <Ionicons size={20} name='close-outline' color="#fff"></Ionicons>
          <Text style={[styles.buttonLabel, styles.modernButtonText]}>{label}</Text>
        </Pressable>
      </View>
    );
  }
  else if (theme === 'return') {
    return (
      <View style={[styles.buttonContainer]}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonMain,
            styles.modernButton,
            {
              backgroundColor: pressed ? '#2980b9' : '#3498db',
              shadowOpacity: pressed ? 0.1 : 0.3
            }
          ]}
          onPress={onPress}
        >
          <Ionicons size={20} name='arrow-back' color="#fff"></Ionicons>
          <Text style={[styles.buttonLabel, styles.modernButtonText]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  else if (theme === 'see') {
    return (
      <View style={[styles.buttonContainer]}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonMain,
            styles.modernButton,
            {
              backgroundColor: pressed ? '#2980b9' : '#3498db',
              shadowOpacity: pressed ? 0.1 : 0.3
            }
          ]}
          onPress={onPress}
        >
          <Ionicons size={20} name='eye' color="#fff"></Ionicons>
          <Text style={[styles.buttonLabel, styles.modernButtonText]}>{label}</Text>
        </Pressable>
      </View>
    );
  }
  else if (theme === 'basique') {
    return (
      <View style={[styles.buttonContainer]}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonMain,
            styles.modernButton,
            {
              backgroundColor: pressed ? '#2980b9' : '#3498db',
              shadowOpacity: pressed ? 0.1 : 0.3
            }
          ]}
          onPress={onPress}
        >
          <Text style={[styles.buttonLabel, styles.modernButtonText]}>{label}</Text>
        </Pressable>
      </View>
    );
  }
  else if (theme === 'primary') {
    return (
      <View
        style={[
          styles.buttonContainerMain,
          { borderWidth: 4, borderColor: '#ffd33d', borderRadius: 18 },
        ]}>
        <Pressable style={[styles.buttonMain, { backgroundColor: '#fff' }]} onPress={onPress}>
          {/* <FontAwesome name="picture-o" size={18} color="#25292e" style={styles.buttonIcon} /> */}
          <Text style={[styles.buttonLabel, { color: '#25292e' }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }
  else if (theme === 'secondary') {
    return (
      <View
        style={[
          styles.buttonContainerMain,
          { borderWidth: 4, borderColor: '#ffd33d', borderRadius: 18 },
        ]}>
        <Pressable style={[styles.buttonMain, { backgroundColor: '#ff0000' }]} onPress={onPress}>
          <FontAwesome name="picture-o" size={18} color="#25292e" style={styles.buttonIcon} />
          <Text style={[styles.buttonLabel, { color: '#25292e' }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainerMain}>
      <Pressable style={styles.buttonMain} onPress={onPress}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainerMain: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  buttonMain: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    color: '#000000',
    fontSize: 16,
  },
  buttonContainer: {
    height: 68,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    flex: 1,
  },
  editButton: {
    borderWidth: 2,
  },
  deleteButton: {
    borderWidth: 2,
  },
  modernButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 10,
    paddingHorizontal: 16,
    height: 48,
  },
  modernButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
});