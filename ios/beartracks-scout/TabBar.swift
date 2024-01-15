//
//  TabBar.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct TabBar: View {
    @State private var loginRequired: Bool = false
    @ObservedObject var scoutFormController: ScoutingController = ScoutingController()
    
    var body: some View {
        TabView(selection: $scoutFormController.currentTab) {
            StartView(controller: scoutFormController)
                .tabItem {
                    Label("start", systemImage: "backward.end")
                }
                .tag(Tab.start)
            
            GameView(controller: scoutFormController)
                .tabItem {
                    Label("game", systemImage: "gamecontroller")
                }
                .tag(Tab.game)
            
            EndView(controller: scoutFormController)
                .tabItem {
                    Label("end", systemImage: "forward.end")
                }
                .tag(Tab.end)
            
            ReviewView(controller: scoutFormController)
                .tabItem {
                    Label("review", systemImage: "magnifyingglass")
                }
                .tag(Tab.review)
            
            SettingsView()
                .tabItem {
                    Label("settings", systemImage: "gear")
                }
                .tag(Tab.settings)
        }
        .onAppear() {
            checkLoginState { isLoggedIn in
                loginRequired = !isLoggedIn
            }
        }
        .sheet(isPresented: $loginRequired, onDismiss: {
            loginRequired = false
            checkLoginState { isLoggedIn in
                loginRequired = !isLoggedIn
            }
        }) {
            LoginView()
        }
    }
}

#Preview {
    TabBar()
}

enum Tab {
    case start, game, end, review, settings
}
