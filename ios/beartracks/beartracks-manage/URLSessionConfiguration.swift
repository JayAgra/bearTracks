//
//  URLSessionConfiguration.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import Foundation

let sharedSession: URLSession = {
  let configuration = URLSessionConfiguration.default
  configuration.httpCookieStorage = HTTPCookieStorage.shared

  return URLSession(configuration: configuration)
}()
