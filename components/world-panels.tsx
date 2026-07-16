'use client'

import { Building2Icon, UsersIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorldDataStatus } from '@/components/world-data-status'
import { useServer } from '@/lib/server-context'
import type { WorldGuild, WorldPlayer } from '@/lib/types'
import { useWorld } from '@/lib/use-world'
import { formatRelativeTime, formatWorldDateTime } from '@/lib/world-time'

function canonicalUid(value: string) {
  return value.trim().toUpperCase()
}

function WorldRosterPanel({ players }: { players: WorldPlayer[] }) {
  const { players: onlinePlayers } = useServer()
  const onlineUids = new Set(
    onlinePlayers.map((player) => canonicalUid(player.playerId)).filter(Boolean),
  )
  const sortedPlayers = [...players].sort((a, b) =>
    b.level - a.level || a.nickname.localeCompare(b.nickname, undefined, { sensitivity: 'base' }),
  )

  return (
    <div className="max-h-[36rem] overflow-auto rounded-lg border border-border/50">
      <table className="w-full min-w-[660px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-card/95 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <tr>
            <th className="px-4 py-3 font-medium">Nickname</th>
            <th className="px-4 py-3 text-right font-medium">Level</th>
            <th className="px-4 py-3 text-right font-medium">Pals</th>
            <th className="px-4 py-3 font-medium">Last seen</th>
            <th className="px-4 py-3 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {sortedPlayers.map((player) => {
            const online = onlineUids.has(canonicalUid(player.uid))
            return (
              <tr key={player.uid} className="transition-colors hover:bg-muted/25">
                <td className="max-w-72 truncate px-4 py-3 font-medium text-foreground">{player.nickname || 'Unnamed player'}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{player.level}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{player.pal_count}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground" title={formatWorldDateTime(player.last_seen)}>
                  {formatRelativeTime(player.last_seen)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge
                    variant="outline"
                    className={online
                      ? 'border-green-500/45 bg-green-500/10 font-mono text-[10px] uppercase tracking-[0.14em] text-green-500'
                      : 'border-border/60 bg-muted/20 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'}
                  >
                    {online ? 'Online' : 'Offline'}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function WorldGuildPanel({ guilds }: { guilds: WorldGuild[] }) {
  const sortedGuilds = [...guilds].sort((a, b) =>
    b.base_level - a.base_level || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )

  return (
    <div className="max-h-[36rem] overflow-auto rounded-lg border border-border/50">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-card/95 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <tr>
            <th className="px-4 py-3 font-medium">Guild</th>
            <th className="px-4 py-3 text-right font-medium">Base level</th>
            <th className="px-4 py-3 text-right font-medium">Bases</th>
            <th className="px-4 py-3 font-medium">Members</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {sortedGuilds.map((guild) => (
            <tr key={guild.id} className="align-top transition-colors hover:bg-muted/25">
              <td className="max-w-64 px-4 py-3 font-medium text-foreground">
                <div className="truncate">{guild.name || 'Unnamed Guild'}</div>
                <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground" title={guild.id}>{guild.id}</div>
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{guild.base_level}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{guild.base_count}</td>
              <td className="px-4 py-3">
                {guild.members.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No members</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {guild.members.map((member) => (
                      <span
                        key={member.uid}
                        className="rounded-md border border-border/50 bg-muted/20 px-2 py-1 text-xs text-foreground"
                        title={`${member.nickname || 'Unnamed player'} · last seen ${formatWorldDateTime(member.last_seen)}`}
                      >
                        {member.nickname || 'Unnamed player'}
                        <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">{formatRelativeTime(member.last_seen)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function WorldPanels() {
  const { world, available, permissionDenied } = useWorld()

  if (permissionDenied) return null

  return (
    <Card className="gap-4 border-border/60 bg-card/55 py-5 backdrop-blur-sm">
      <CardHeader className="gap-3 px-5 sm:px-6">
        <div>
          <CardTitle className="font-mono text-base uppercase tracking-[0.16em]">World intelligence</CardTitle>
          <CardDescription className="mt-1">Save-derived roster, guild, and base records.</CardDescription>
        </div>
        <WorldDataStatus />
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        {!available || !world ? (
          <div className="rounded-lg border border-dashed border-border/60 px-4 py-12 text-center font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            No world data yet
          </div>
        ) : (
          <Tabs defaultValue="roster" className="gap-4">
            <TabsList className="h-10 rounded-md border border-border/60 bg-muted/20">
              <TabsTrigger value="roster" className="gap-2 px-4 font-mono text-[11px] uppercase tracking-[0.16em] data-[state=active]:border-primary/60 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <UsersIcon className="h-3.5 w-3.5" /> Roster {world.players.length}
              </TabsTrigger>
              <TabsTrigger value="guilds" className="gap-2 px-4 font-mono text-[11px] uppercase tracking-[0.16em] data-[state=active]:border-primary/60 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Building2Icon className="h-3.5 w-3.5" /> Guilds {world.guilds.length}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="roster"><WorldRosterPanel players={world.players} /></TabsContent>
            <TabsContent value="guilds"><WorldGuildPanel guilds={world.guilds} /></TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
