import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PoemCard as PoemCardType } from '@/types';

interface PoemCardProps {
  card: PoemCardType;
  index?: number;
}

export const PoemCard: React.FC<PoemCardProps> = ({ card, index = 0 }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.poemText}>{card.Poem_Text_KR}</Text>
      <Text style={styles.poemTextJP}>{card.Poem_Text_JP}</Text>
      <View style={styles.tagContainer}>
        <Text style={styles.tagText}>{card.Kisho_Tag}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    maxWidth: 400,
    aspectRatio: 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  poemText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 36,
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
  poemTextJP: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 12,
  },
  tagContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});


