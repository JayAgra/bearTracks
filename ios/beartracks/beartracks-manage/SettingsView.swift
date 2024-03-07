//
//  SettingsView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import ActivityKit
import SwiftUI

struct SettingsView: View {
  @Binding var loginRequired: Bool

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack {
          VStack {
            Button("activity") {
              if ActivityAuthorizationInfo().areActivitiesEnabled {
                do {
                  let attrs = SystemStatusAttributes(hostname: "beartracks.io")
                  let initialState = SystemStatusAttributes.ContentState(
                    total_mem: 1000, used_mem: 939, total_swap: 100, used_swap: 0,
                    uptime: 2_313_124, load_one: 0.02, load_five: 0.85, load_fifteen: 0.93,
                    sessions: 2)

                  let activity = try Activity.request(
                    attributes: attrs,
                    content: .init(state: initialState, staleDate: nil),
                    pushType: nil
                  )
                } catch {}
              }
            }

            Button("Log Out") {
              if let cookies = HTTPCookieStorage.shared.cookies(
                for: sharedSession.configuration.urlCache?.cachedResponse(
                  for: URLRequest(url: URL(string: "https://beartracks.io")!))?.response.url ?? URL(
                    string: "https://beartracks.io")!)
              {
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
