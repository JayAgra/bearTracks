//
//  beartracksApp.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI
import UserNotifications

public enum Tab {
  case teams, matches, data, settings
}

@main
struct beartracksApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool = UserDefaults().bool(forKey: "darkMode") ?? true
    @StateObject public var appState = AppState()
    let notificationCenter = UNUserNotificationCenter.current()
    @UIApplicationDelegateAdaptor private var appDelegate: NotificationDelegate
    
    var body: some Scene {
        WindowGroup {
            if !appState.loginRequired {
#if targetEnvironment(macCatalyst)
                NavigationView {
                    List(selection: $appState.selectedTab) {
                        Label("teams", systemImage: "list.number")
                            .tag(Tab.teams)
                        Label("matches", systemImage: "calendar")
                            .tag(Tab.matches)
                        Label("data", systemImage: "magnifyingglass")
                            .tag(Tab.data)
                        Label("settings", systemImage: "gear")
                            .tag(Tab.settings)
                    }
                    .navigationTitle("bearTracks")
                    switch appState.selectedTab {
                    case .teams:
                        Teams()
                            .environmentObject(appState)
                    case .matches:
                        MatchList()
                            .environmentObject(appState)
                    case .data:
                        DataView()
                            .environmentObject(appState)
                    case .settings:
                        SettingsView()
                            .environmentObject(appState)
                    case nil:
                        LoginView()
                            .environmentObject(appState)
                    }
                }
                .preferredColorScheme(darkMode ? .dark : .light)
                .onAppear {
                    appState.checkLoginState()
                    Task {
                        do {
                            try await notificationCenter.requestAuthorization(options: [.alert, .badge, .sound])
                        } catch {
                            print("failed to request notification auth")
                        }
                    }
                    appDelegate.app = self
                }
                .environmentObject(appState)
#else
                TabView(selection: $appState.selectedTab) {
                    Teams()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Teams", systemImage: "list.number")
                        }
                        .tag(Tab.teams)
                    MatchList()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Matches", systemImage: "calendar")
                        }
                        .tag(Tab.matches)
                    DataView()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Data", systemImage: "magnifyingglass")
                        }
                        .tag(Tab.data)
                    SettingsView()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Settings", systemImage: "gear")
                        }
                        .tag(Tab.settings)
                }
                .preferredColorScheme(darkMode ? .dark : .light)
                .onAppear {
                    appState.checkLoginState()
#if os(iOS)
                    Task {
                        do {
                            try await notificationCenter.requestAuthorization(options: [.alert, .badge, .sound])
                        } catch {
                            print("failed to request notification auth")
                        }
                    }
                    appDelegate.app = self
#endif
                }
                .environmentObject(appState)
#endif
            } else {
                LoginView()
                    .environmentObject(appState)
                    .preferredColorScheme(darkMode ? .dark : .light)
                    .onAppear {
                        appState.checkLoginState()
                    }
            }
        }
    }
}
