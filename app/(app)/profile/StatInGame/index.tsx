import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function APIWaitingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icône */}
        <Ionicons name="time-outline" size={64} color="#64748b" style={styles.icon} />
        
        {/* Titre */}
        <Text style={styles.title}>API en cours de développement</Text>
        
        {/* Message principal */}
        <Text style={styles.message}>
          Dès que l'API sera disponible, les fonctionnalités suivantes seront accessibles :
        </Text>
        
        {/* Liste des fonctionnalités */}
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>• Vos dernières morts</Text>
          <Text style={styles.featureItem}>• Votre attendance</Text>
          <Text style={styles.featureItem}>• Votre fame PvE</Text>
          <Text style={styles.featureItem}>• Votre fame PvP</Text>
        </View>
        
        {/* Message de fin */}
        <Text style={styles.footerMessage}>
          Merci pour votre patience !
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresList: {
    alignSelf: 'stretch',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  footerMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});