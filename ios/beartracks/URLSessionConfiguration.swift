//
//  URLSessionConfiguration.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/13/24.
//

import Foundation

/// Shared `URLSession` configuration
let sharedSession: URLSession = {
    let configuration = URLSessionConfiguration.default
    configuration.httpCookieStorage = HTTPCookieStorage.shared
    
    return URLSession(configuration: configuration)
}()
