import { Text } from 'react-native';
import { Redirect, Stack, Tabs } from 'expo-router';
import { useAuth } from '@/context/ctx';
import React, { useState, useEffect } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function TabLayout() {
  const { user, loading } = useAuth();
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="tickets"
        options={{ headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "ticket" : "ticket-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{ headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
// o
