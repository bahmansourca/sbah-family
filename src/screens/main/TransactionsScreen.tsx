import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import theme from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

const TransactionsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  // TODO: Replace with actual transactions from Redux store
  const transactions = [
    {
      id: '1',
      type: 'deposit',
      amount: 300000,
      currency: 'GNF',
      date: '2024-03-15',
      status: 'completed',
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 150000,
      currency: 'GNF',
      date: '2024-03-14',
      status: 'completed',
    },
  ];

  const renderTransaction = ({ item }: any) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionType}>
          {item.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
        </Text>
        <Text
          style={[
            styles.transactionAmount,
            {
              color:
                item.type === 'deposit'
                  ? theme.colors.secondary
                  : theme.colors.danger,
            },
          ]}
        >
          {item.type === 'deposit' ? '+' : '-'}
          {item.amount.toLocaleString()} {item.currency}
        </Text>
      </View>
      <View style={styles.transactionFooter}>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <Text
          style={[
            styles.transactionStatus,
            {
              color:
                item.status === 'completed'
                  ? theme.colors.secondary
                  : theme.colors.warning,
            },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
        <View style={styles.filterContainer}>
          <Button
            title="All"
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setFilter('all')}
            style={styles.filterButton}
          />
          <Button
            title="Deposits"
            variant={filter === 'deposits' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setFilter('deposits')}
            style={styles.filterButton}
          />
          <Button
            title="Withdrawals"
            variant={filter === 'withdrawals' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setFilter('withdrawals')}
            style={styles.filterButton}
          />
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions found</Text>
        }
      />
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
  searchInput: {
    marginBottom: theme.spacing.md,
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
  transactionItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  transactionType: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
    fontFamily: theme.typography.fontFamily.medium,
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray,
  },
  transactionStatus: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.gray,
    fontSize: theme.typography.fontSize.md,
    padding: theme.spacing.lg,
  },
});

export default TransactionsScreen; 