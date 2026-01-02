package com.example.bulkemail.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "smtp_accounts")
@Getter
@Setter
public class SmtpAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SmtpProvider provider;

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private Integer port;

    private String username;

    private String password;

    @Column(nullable = false)
    private boolean useTls;

    @Column(nullable = false)
    private Integer throttlePerMinute;
}
