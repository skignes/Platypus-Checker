/*
** EPITECH PROJECT, 2025
** Platypus-Checker
** File description:
** jenkins/binary/ftrace/main.c
*/

#include <stdio.h>

int recursive_print(int n)
{
    if (n <= 0)
		return 0;
    return 1 + recursive_print(n - 1);
}
int main(void)
{
    printf("%d\n", recursive_print(5));
    return 0;
}
