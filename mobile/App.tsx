import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { io } from 'socket.io-client';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_time?: string;
};

const SOCKET_URL = 'http://10.17.13.35:3000';


export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to backend:', socket.id);
      setConnected(true);
    });

    socket.on('existing_leads', (existingLeads: Lead[]) => {
      setLeads(existingLeads);
    });

    socket.on('new_lead', (lead: Lead) => {
      console.log('New lead received:', lead);

      setLeads((currentLeads) => [lead, ...currentLeads]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend');
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LEADS</Text>

        <Text style={styles.status}>
          {connected ? '● Connected' : '● Disconnected'}
        </Text>
      </View>

      {leads.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No leads yet</Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>{item.email}</Text>

              {item.phone ? (
                <Text style={styles.info}>{item.phone}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  status: {
    marginTop: 5,
    fontSize: 14,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 18,
  },

  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  info: {
    fontSize: 15,
    marginTop: 2,
  },
});