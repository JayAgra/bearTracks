//
//  SettingsView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import SwiftUI

struct SettingsView: View {
    @Binding var loginRequired: Bool
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack {
                    HStack {
                        Button("Log Out") {
                            if let cookies = HTTPCookieStorage.shared.cookies(for: sharedSession.configuration.urlCache?.cachedResponse(for: URLRequest(url: URL(string: "https://beartracks.io")!))?.response.url ?? URL(string: "https://beartracks.io")!) {
                                for cookie in cookies {
                                    sharedSession.configuration.httpCookieStorage?.deleteCookie(cookie)
                                }
                                loginRequired = true
                            }
                        }
                        .foregroundStyle(Color.pink)
                        .buttonStyle(.bordered)
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}

struct SettingsView_Preview: PreviewProvider {
    @State static var loginReq = false
    static var previews: some View {
        SettingsView(loginRequired: $loginReq)
    }
}
