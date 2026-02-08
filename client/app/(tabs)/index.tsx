// app/(tabs)/index.tsx
import { useCallback, useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScreenTimeService } from "../../services/screenTimeService";
const DeviceActivity = require("react-native-device-activity");
type AuthStatus = "notDetermined" | "denied" | "approved";
function getNudgeMessage(goal: string | null): string {
  if (goal) { return 'Remember, you wanted to: "' + goal + '"\n\nMaybe now is a good time to work on that instead?\n\nYour call.'; }
  return "You've been spending a lot of time here.\n\nConsider doing something productive.\n\nYour call.";
}
export default function HomeScreen() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("notDetermined");
  const [selection, setSelection] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [currentGoal, setCurrentGoal] = useState<string | null>("Finish Calc 2 HW by Friday");
  const [goalInput, setGoalInput] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  useEffect(() => { const m: Record<number, AuthStatus> = { 0: "notDetermined", 1: "denied", 2: "approved" }; setAuthStatus(m[ScreenTimeService.getAuthStatus()] ?? "notDetermined"); }, []);
  useEffect(() => { if (authStatus === "approved") { ScreenTimeService.updateNudge("Before you scroll...", getNudgeMessage(currentGoal)); } }, [authStatus, currentGoal, timeLimit]);
  const handleAuth = useCallback(async () => { try { const s = await ScreenTimeService.requestAuth(); const m: Record<number, AuthStatus> = { 0: "notDetermined", 1: "denied", 2: "approved" }; setAuthStatus(m[s] ?? "notDetermined"); } catch (e) { Alert.alert("Error", String(e)); } }, []);
  const handleSaveGoal = useCallback(() => { if (!goalInput.trim()) return; const g = goalInput.trim(); setCurrentGoal(g); setGoalInput(""); ScreenTimeService.updateNudge("Before you scroll...", getNudgeMessage(g)); }, [goalInput]);
  const handleBlock = useCallback(() => { if (!selection) { Alert.alert("Select Apps", "Pick apps first."); return; } ScreenTimeService.saveSelection(selection); ScreenTimeService.updateNudge("Before you scroll...", getNudgeMessage(currentGoal)); ScreenTimeService.blockApps(); setIsBlocking(true); }, [selection, currentGoal]);
  const handleUnblock = useCallback(() => { ScreenTimeService.stopMonitoring(); ScreenTimeService.resetBlocks(); ScreenTimeService.unblockApps(); setIsBlocking(false); setIsMonitoring(false); }, []);
  const handleStartMonitoring = useCallback(() => { if (!selection) { Alert.alert("Select Apps", "Pick apps first."); return; } ScreenTimeService.updateNudge("Time check", "You hit your " + timeLimit + "-min limit.\n\n" + getNudgeMessage(currentGoal)); ScreenTimeService.startMonitoring(selection, timeLimit); setIsMonitoring(true); Alert.alert("Trail is watching", "After " + timeLimit + " min of use you will get a nudge."); }, [selection, timeLimit, currentGoal]);
  const handleStopMonitoring = useCallback(() => { ScreenTimeService.stopMonitoring(); ScreenTimeService.resetBlocks(); setIsBlocking(false); setIsMonitoring(false); }, []);
  if (authStatus !== "approved") { return (<SafeAreaView style={st.container}><View style={st.centered}><Text style={{fontSize:64,marginBottom:16}}>🥾</Text><Text style={st.title}>Trail</Text><Text style={st.tagline}>Gentle nudges to keep you on your path</Text><Text style={st.description}>Trail helps you stay focused by giving you a friendly reminder when you open distracting apps.</Text><TouchableOpacity style={st.primaryBtn} onPress={handleAuth}><Text style={st.primaryBtnText}>{authStatus === "denied" ? "Open Settings" : "Get Started"}</Text></TouchableOpacity></View></SafeAreaView>); }
  return (<SafeAreaView style={st.container}><ScrollView contentContainerStyle={st.scroll}>
    <Text style={st.title}>Trail 🥾</Text>
    <Text style={st.tagline}>What are you working towards?</Text>
    <View style={st.card}><Text style={st.cardLabel}>YOUR CURRENT FOCUS</Text>
      {currentGoal ? (<View><Text style={st.goalText}>"{currentGoal}"</Text><TouchableOpacity onPress={() => setCurrentGoal(null)}><Text style={st.clearGoal}>Change goal</Text></TouchableOpacity></View>) : (<View><Text style={st.cardHint}>Set a goal so Trail can remind you</Text><TextInput style={st.goalInput} placeholder="e.g., Finish Calc 2 HW by Friday" placeholderTextColor="#555" value={goalInput} onChangeText={setGoalInput} onSubmitEditing={handleSaveGoal} returnKeyType="done" /><TouchableOpacity style={[st.smallBtn, !goalInput.trim() && st.disabledBtn]} onPress={handleSaveGoal} disabled={!goalInput.trim()}><Text style={st.smallBtnText}>Set Goal</Text></TouchableOpacity></View>)}
    </View>
    <Text style={st.sectionTitle}>Choose apps to nudge about</Text>
    <View style={st.pickerContainer}><DeviceActivity.DeviceActivitySelectionView style={st.picker} familyActivitySelection={selection} onSelectionChange={(e: any) => setSelection(e.nativeEvent.familyActivitySelection)} /></View>
    {selection && <Text style={st.selectedText}>Apps selected</Text>}
    <Text style={st.sectionTitle}>Quick Actions</Text>
    <TouchableOpacity style={[st.primaryBtn, isBlocking && st.activeBtn]} onPress={isBlocking ? handleUnblock : handleBlock}><Text style={st.primaryBtnText}>{isBlocking ? "Remove Nudge Screen" : "Activate Nudge Now"}</Text></TouchableOpacity>
    <Text style={st.sectionTitle}>Daily Time Limit</Text>
    <Text style={st.sectionHint}>After this much daily use, Trail will nudge you</Text>
    <View style={st.timeLimitRow}>{[15,30,60,120].map((m) => (<TouchableOpacity key={m} style={[st.timePill, timeLimit===m && st.timePillActive]} onPress={() => setTimeLimit(m)}><Text style={[st.timePillText, timeLimit===m && st.timePillTextActive]}>{m<60 ? m+"m" : m/60+"h"}</Text></TouchableOpacity>))}</View>
    <TouchableOpacity style={[st.primaryBtn, isMonitoring && st.activeBtn]} onPress={isMonitoring ? handleStopMonitoring : handleStartMonitoring}><Text style={st.primaryBtnText}>{isMonitoring ? "Stop Monitoring" : "Start "+timeLimit+"min Daily Limit"}</Text></TouchableOpacity>
    {isMonitoring && (<View style={st.statusCard}><Text style={{fontSize:24}}>👁️</Text><Text style={st.statusText}>Trail is active. After {timeLimit} min of use you will see a reminder.</Text></View>)}
    <View style={{height:40}} />
  </ScrollView></SafeAreaView>);
}
const st = StyleSheet.create({
  container:{flex:1,backgroundColor:"#0a0a0a"},centered:{flex:1,justifyContent:"center",alignItems:"center",padding:32},scroll:{padding:20,paddingBottom:40},
  title:{fontSize:32,fontWeight:"bold",color:"#fff",marginTop:20},tagline:{fontSize:16,color:"#aaa",marginBottom:12},
  description:{fontSize:15,color:"#777",textAlign:"center",lineHeight:22,marginBottom:32,paddingHorizontal:8},
  sectionTitle:{fontSize:18,fontWeight:"700",color:"#ccc",marginTop:28,marginBottom:4},sectionHint:{fontSize:13,color:"#666",marginBottom:12},
  card:{backgroundColor:"#1a1a1a",borderRadius:16,padding:20,marginTop:16,marginBottom:8},
  cardLabel:{fontSize:11,color:"#666",letterSpacing:2,marginBottom:12,fontWeight:"600"},cardHint:{fontSize:14,color:"#888",marginBottom:12},
  goalText:{fontSize:18,color:"#7C6FF7",fontWeight:"600",fontStyle:"italic"},clearGoal:{fontSize:13,color:"#666",marginTop:8},
  goalInput:{backgroundColor:"#111",borderRadius:10,padding:14,color:"#fff",fontSize:15,borderWidth:1,borderColor:"#333",marginBottom:10},
  smallBtn:{backgroundColor:"#7C6FF7",paddingVertical:10,borderRadius:8,alignItems:"center"},smallBtnText:{color:"#fff",fontWeight:"600",fontSize:14},disabledBtn:{opacity:0.4},
  pickerContainer:{backgroundColor:"#1a1a1a",borderRadius:16,overflow:"hidden",marginTop:8,marginBottom:12},picker:{width:"100%" as any,height:400},
  selectedText:{color:"#4CAF50",fontSize:14,fontWeight:"600",marginBottom:8},
  primaryBtn:{backgroundColor:"#7C6FF7",paddingVertical:16,borderRadius:12,alignItems:"center",marginBottom:12},primaryBtnText:{color:"#fff",fontSize:16,fontWeight:"700"},activeBtn:{backgroundColor:"#E53935"},
  timeLimitRow:{flexDirection:"row",gap:10,marginBottom:16},
  timePill:{flex:1,paddingVertical:12,borderRadius:10,backgroundColor:"#1a1a1a",alignItems:"center",borderWidth:1,borderColor:"#333"},timePillActive:{backgroundColor:"#7C6FF7",borderColor:"#7C6FF7"},timePillText:{color:"#888",fontSize:15,fontWeight:"600"},timePillTextActive:{color:"#fff"},
  statusCard:{backgroundColor:"#1a1a2a",borderRadius:12,padding:16,flexDirection:"row",alignItems:"center",gap:12,borderWidth:1,borderColor:"#2a2a4a"},statusText:{color:"#aaa",fontSize:14,flex:1,lineHeight:20},
  hint:{color:"#666",fontSize:13,marginTop:12,textAlign:"center"},
});
