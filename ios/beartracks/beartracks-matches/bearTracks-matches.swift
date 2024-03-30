//
//  bearTracks-matches.swift
//  beartracks-matches
//
//  Created by Jayen Agrawal on 3/29/24.
//

import SwiftUI

public enum Tab {
  case teams, matches, data, settings
}

@main
struct beartracksApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool = UserDefaults(suiteName: "group.com.jayagra.beartracks")?.bool(forKey: "darkMode") ?? true
    @StateObject public var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            if !appState.loginRequired {
                MatchDetailView(match: 1)
                    .environmentObject(appState)
                    .preferredColorScheme(darkMode ? .dark : .light)
                    .onAppear {
                        checkLoginState { isLoggedIn in
                            appState.loginRequired = !isLoggedIn
                        }
                        appState.fetchMatchJson()
                    }
            } else {
                LoginView()
                    .environmentObject(appState)
                    .preferredColorScheme(darkMode ? .dark : .light)
                    .onAppear {
                        checkLoginState { isLoggedIn in
                            appState.loginRequired = !isLoggedIn
                        }
                    }
            }
        }
    }
}
