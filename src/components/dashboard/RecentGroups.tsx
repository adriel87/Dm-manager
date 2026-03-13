import { Card, CardBody, CardHeader } from "@heroui/react";
import { DashboardGroup } from "@/domain/dashboard/dashboard";

interface RecentGroupsProps {
  initialData: DashboardGroup[];
}

export function RecentGroups({ initialData }: RecentGroupsProps) {
  const groups = initialData ?? [];

  if (groups.length === 0) {
    return (
      <Card className="bg-zinc-800 border border-zinc-700">
        <CardBody>
          <p className="text-zinc-500 text-center">No hay grupos todavía</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <Card key={group.id} className="bg-zinc-800 border border-zinc-700">
          <CardHeader>
            <h3 className="text-white font-semibold">{group.name}</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <ul className="space-y-2">
              {group.members.map((member) => (
                <li key={member.characterName} className="text-sm">
                  <span className="text-zinc-300">{member.characterName}</span>
                  {member.playerName && (
                    <span className="text-zinc-500 text-xs ml-2">
                      ({member.playerName})
                    </span>
                  )}
                  <span className="text-zinc-400 ml-2">
                    Lv. {member.level} {member.classType}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
