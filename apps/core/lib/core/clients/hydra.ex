defmodule Core.Clients.Hydra do
  require Logger

  defmodule Response, do: defstruct [:redirect_to]
  defmodule Client do
    defstruct [
      :client_id,
      :client_secret,
      :client_uri,
      :redirect_uris,
      :client_name,
      :logo_uri
    ]
  end

  defmodule LoginRequest do
    defstruct [
      :client,
      :oidc_context,
      :requested_scope,
      :subject
    ]
  end

  @duration 60 * 60 * 24

  def create_client(attrs) do
    admin_url("#{conf(:hydra_admin)}/clients")
    |> HTTPoison.post(Jason.encode!(attrs), headers())
    |> handle_response(%Client{})
  end

  def update_client(client_id, attrs) do
    admin_url("/clients/#{client_id}")
    |> HTTPoison.post(Jason.encode!(attrs), headers())
    |> handle_response(%Client{})
  end

  def get_login(challenge) do
    admin_url("/oauth2/auth/requests/login?login_challenge=#{challenge}")
    |> HTTPoison.get(headers())
    |> handle_response(%LoginRequest{client: %Client{}})
  end

  def accept_login(challenge, user) do
    body = Jason.encode!(%{subject: user.id, remember: true, remember_for: 60 * 60 * 24})
    admin_url("/oauth2/auth/requests/login/accept?login_challenge=#{challenge}")
    |> HTTPoison.put(body, headers())
    |> handle_response(%Response{})
  end

  def reject_login(challenge) do
    admin_url("/oauth2/auth/requests/login/reject?login_challenge=#{challenge}")
    |> HTTPoison.put("{}", headers())
    |> handle_response(%Response{})
  end

  def accept_consent(user, challenge, scopes) do
    body = Jason.encode!(%{
      grant_scope: scopes,
      remember: true,
      remember_for: @duration,
      session: %{
        id_token: user_details(user),
        access_token: %{}
      }
    })
    admin_url("/oauth2/auth/requests/consent/accept?consent_challenge=#{challenge}")
    |> HTTPoison.put(body, headers())
    |> handle_response(%Response{})
  end

  def reject_consent(challenge) do
    admin_url("/oauth2/auth/requests/consent/accept?consent_challenge=#{challenge}")
    |> HTTPoison.put("{}", headers())
    |> handle_response(%Response{})
  end

  defp handle_response({:ok, %{status_code: 200, body: body}}, type),
    do: {:ok, Poison.decode!(body, as: type)}
  defp handle_response(error, _) do
    Logger.error "Failed to call hydra: #{inspect(error)}"
    {:error, :unauthorized}
  end

  defp user_details(user) do
    %{
      groups: user_groups(user),
      avatar: Core.Storage.url({user.avatar, user}, :original),
      name: user.name
    }
  end

  defp user_groups(groups) when is_list(groups), do: Enum.map(groups, & &1.name)
  defp user_groups(_), do: []

  defp admin_url(path), do: "#{conf(:hydra_admin)}#{path}"

  defp conf(key), do: Application.get_env(:core, __MODULE__)[key]

  defp headers(), do: [{"accept", "application/json"}, {"content-type", "application/json"}]
end
