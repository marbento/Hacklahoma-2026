// frontend/app/(tabs)/profile.tsx
// Profile — Avatar creator + name input + settings
import { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AVATAR_PARTS } from "../../assets/avatarData";
import { AvatarRenderer } from "../../components/AvatarRenderer";
import { useAuth } from "../../context/AuthContext";
import { useAvatar } from "../../hooks/useAvatar";
import { C } from "../../theme";

type PartKey = "body" | "hair" | "clothes";

export default function ProfileScreen() {
  const { userName, logout } = useAuth();
  const { avatar, updatePart, save } = useAvatar();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(avatar.name || userName || "");
  const [activeTab, setActiveTab] = useState<PartKey>("body");

  const handleSaveName = useCallback(async () => {
    if (nameInput.trim()) {
      await save({ ...avatar, name: nameInput.trim() });
    }
    setEditingName(false);
  }, [nameInput, avatar, save]);

  const displayName = avatar.name || userName || "Trail Hiker";

  const tabs: { key: PartKey; label: string; emoji: string }[] = [
    { key: "body", label: "Skin", emoji: "🧑" },
    { key: "hair", label: "Hair", emoji: "💇" },
    { key: "clothes", label: "Outfit", emoji: "👕" },
  ];

  const options =
    activeTab === "body"
      ? AVATAR_PARTS.bodies
      : activeTab === "hair"
        ? AVATAR_PARTS.hairs
        : AVATAR_PARTS.clothes;

  const currentId = avatar[activeTab];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.header}>PROFILE</Text>

        {/* ═══ AVATAR DISPLAY ═══ */}
        <View style={s.avatarSection}>
          <View style={s.avatarFrame}>
            <AvatarRenderer config={avatar} size={160} />
          </View>

          {/* Name */}
          {editingName ? (
            <View style={s.nameEditRow}>
              <TextInput
                style={s.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={C.textLight}
                autoFocus
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
              />
              <TouchableOpacity style={s.nameSaveBtn} onPress={handleSaveName}>
                <Text style={s.nameSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setNameInput(displayName);
                setEditingName(true);
              }}
            >
              <Text style={s.displayName}>{displayName}</Text>
              <Text style={s.editHint}>tap to edit name</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ═══ AVATAR CUSTOMIZER ═══ */}
        <Text style={s.sectionLabel}>CUSTOMIZE YOUR HIKER</Text>
        <View style={s.card}>
          {/* Category tabs */}
          <View style={s.tabRow}>
            {tabs.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[s.tab, activeTab === t.key && s.tabActive]}
                onPress={() => setActiveTab(t.key)}
              >
                <Text style={s.tabEmoji}>{t.emoji}</Text>
                <Text
                  style={[s.tabText, activeTab === t.key && s.tabTextActive]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Options */}
          <View style={s.optionsRow}>
            {options.map((opt) => {
              const isSelected = currentId === opt.id;
              const previewConfig = { ...avatar, [activeTab]: opt.id };
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[s.optionCard, isSelected && s.optionCardSelected]}
                  onPress={() => updatePart(activeTab, opt.id)}
                >
                  <View style={s.optionPreview}>
                    <AvatarRenderer config={previewConfig} size={80} />
                  </View>
                  <Text
                    style={[s.optionLabel, isSelected && s.optionLabelSelected]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={s.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={s.saveAvatarBtn}
            onPress={() => {
              save(avatar);
              Alert.alert(
                "Avatar Saved! ✓",
                "Your hiker is ready to hit the trail.",
                [{ text: "OK" }],
              );
            }}
          >
            <Text style={s.saveAvatarBtnText}>💾 Save Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ QUICK ACTIONS ═══ */}
        <Text style={s.sectionLabel}>SETTINGS</Text>
        <TouchableOpacity style={s.menuItem}>
          <Text style={s.menuIcon}>⚙️</Text>
          <Text style={s.menuText}>Manage connections</Text>
          <Text style={s.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem}>
          <Text style={s.menuIcon}>📊</Text>
          <Text style={s.menuText}>View all stats</Text>
          <Text style={s.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem}>
          <Text style={s.menuIcon}>🔔</Text>
          <Text style={s.menuText}>Notifications</Text>
          <Text style={s.menuArrow}>→</Text>
        </TouchableOpacity>

        {/* About */}
        <View style={s.aboutCard}>
          <Text style={s.aboutText}>Trail v1.0.0</Text>
          <Text style={s.aboutHint}>
            Gentle nudges to keep you on your path.
          </Text>
          <Text style={s.aboutHint}>Built for Hacklahoma 2026 🏕️</Text>
        </View>

        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() => {
            Alert.alert("Log Out?", "", [
              { text: "Cancel", style: "cancel" },
              { text: "Log Out", style: "destructive", onPress: logout },
            ]);
          }}
        >
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.beige },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textMid,
    letterSpacing: 4,
    marginTop: 10,
    marginBottom: 20,
  },

  // Avatar display
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarFrame: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: C.cardBg,
    borderWidth: 3,
    borderColor: C.kelp,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: C.kelp,
    marginTop: 14,
    textAlign: "center",
  },
  editHint: {
    fontSize: 12,
    color: C.textLight,
    textAlign: "center",
    marginTop: 2,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  nameInput: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 10,
    padding: 12,
    color: C.textDark,
    fontSize: 16,
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 200,
  },
  nameSaveBtn: {
    backgroundColor: C.kelp,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nameSaveBtnText: { color: C.textOnKelp, fontWeight: "700", fontSize: 14 },

  // Customizer
  sectionLabel: {
    fontSize: 13,
    color: C.textLight,
    letterSpacing: 3,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cream,
    marginBottom: 20,
  },

  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.parchment,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cream,
  },
  tabActive: { backgroundColor: C.kelp, borderColor: C.kelp },
  tabEmoji: { fontSize: 18, marginBottom: 2 },
  tabText: { fontSize: 12, fontWeight: "600", color: C.textMid },
  tabTextActive: { color: C.textOnKelp },

  optionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  optionCard: {
    width: "47%",
    backgroundColor: C.parchment,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.cream,
  },
  optionCardSelected: { borderColor: C.kelp, backgroundColor: C.kelp + "10" },
  optionPreview: { width: 80, height: 80, overflow: "hidden", marginBottom: 8 },
  optionLabel: { fontSize: 14, fontWeight: "600", color: C.textMid },
  optionLabelSelected: { color: C.kelp },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 10,
    fontSize: 16,
    color: C.kelp,
    fontWeight: "bold",
  },
  saveAvatarBtn: {
    backgroundColor: C.kelp,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveAvatarBtnText: {
    color: C.textOnKelp,
    fontSize: 16,
    fontWeight: "700",
  },

  // Menu
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  menuIcon: { fontSize: 20 },
  menuText: { color: C.textDark, fontSize: 15, flex: 1 },
  menuArrow: { color: C.textLight, fontSize: 16 },

  aboutCard: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cream,
    marginTop: 20,
  },
  aboutText: { color: C.textDark, fontSize: 15, fontWeight: "600" },
  aboutHint: { color: C.textLight, fontSize: 13, marginTop: 4 },

  logoutBtn: {
    borderWidth: 1,
    borderColor: C.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  logoutText: { color: C.danger, fontSize: 16, fontWeight: "600" },
});
