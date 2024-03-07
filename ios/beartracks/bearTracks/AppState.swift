//
//  AppState.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/7/24.
//

import Combine
import Foundation

class AppState: ObservableObject {
  #if targetEnvironment(macCatalyst)
    @Published public var selectedTab: Tab? = .teams
  #elseif os(watchOS)
  #else
    @Published public var selectedTab: Tab = .teams
  #endif
  @Published public var loginRequired: Bool = false
  private var cancellables: Set<AnyCancellable> = []

  #if !os(watchOS)
    init() {
      $selectedTab
        .receive(on: DispatchQueue.main)
        .sink { _ in }
        .store(in: &cancellables)
    }
  #endif
}
