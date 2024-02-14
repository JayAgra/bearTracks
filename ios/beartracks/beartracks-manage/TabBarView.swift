//
//  TabView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import SwiftUI

struct TabBarView: View {
    enum Tab {
        case data, scouts, teams, settings
    }
    @State private var loginRequired: Bool = false
    @State private var selectedTab: Tab = .settings
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DataView()
                .tabItem {
                    Label("data", systemImage: "list.dash")
                }
                .tag(Tab.data)
            UsersView()
                .tabItem {
                    Label("users", systemImage: "person")
                }
                .tag(Tab.scouts)
            TeamsView()
                .tabItem {
                    Label("teams", systemImage: "person.3")
                }
                .tag(Tab.teams)
            SettingsView(loginRequired: $loginRequired)
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
    TabBarView()
}
