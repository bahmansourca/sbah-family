import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import theme from '../../theme';
import Button from '../../components/Button';

const EventsScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // TODO: Replace with actual events from Redux store
  const events = [
    {
      id: '1',
      title: 'Mariage de Mamadou',
      description: 'Célébration du mariage de Mamadou',
      date: '2024-06-15',
      type: 'wedding',
      budget: 5000000,
      status: 'planned',
    },
    {
      id: '2',
      title: 'Funérailles de Papa',
      description: 'Cérémonie funéraire',
      date: '2024-04-01',
      type: 'funeral',
      budget: 3000000,
      status: 'in_progress',
    },
  ];

  const renderEvent = ({ item }: any) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <View>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDate}>{item.date}</Text>
        </View>
        <View
          style={[
            styles.eventType,
            {
              backgroundColor:
                item.type === 'wedding'
                  ? theme.colors.secondary
                  : theme.colors.danger,
            },
          ]}
        >
          <Text style={styles.eventTypeText}>
            {item.type === 'wedding' ? 'Wedding' : 'Funeral'}
          </Text>
        </View>
      </View>

      <Text style={styles.eventDescription}>{item.description}</Text>

      <View style={styles.eventFooter}>
        <Text style={styles.eventBudget}>
          Budget: {item.budget.toLocaleString()} GNF
        </Text>
        <Text
          style={[
            styles.eventStatus,
            {
              color:
                item.status === 'completed'
                  ? theme.colors.secondary
                  : item.status === 'in_progress'
                  ? theme.colors.warning
                  : theme.colors.primary,
            },
          ]}
        >
          {item.status === 'completed'
            ? 'Completed'
            : item.status === 'in_progress'
            ? 'In Progress'
            : 'Planned'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <Button
            title="All"
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setFilter('all')}
            style={styles.filterButton}
          />
          <Button
            title="Upcoming"
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setFilter('upcoming')}
            style={styles.filterButton}
          />
          <Button
            title="Past"
            variant={filter === 'past' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setFilter('past')}
            style={styles.filterButton}
          />
        </View>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No events found</Text>
        }
      />

      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  list: {
    padding: theme.spacing.lg,
  },
  eventItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.dark,
    fontFamily: theme.typography.fontFamily.bold,
  },
  eventDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray,
    marginTop: theme.spacing.xs,
  },
  eventType: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  eventTypeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  eventDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
    marginBottom: theme.spacing.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventBudget: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
    fontFamily: theme.typography.fontFamily.medium,
  },
  eventStatus: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.gray,
    fontSize: theme.typography.fontSize.md,
    padding: theme.spacing.lg,
  },
  addButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default EventsScreen; 